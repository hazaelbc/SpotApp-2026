import { Injectable,Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateResenaDto } from '../dto/resenas/create-resena.dto';
import { UpdateResenaDto } from '../dto/resenas/update-resena.dto';
import * as AWS from 'aws-sdk';

@Injectable()
export class ResenaService {
  private readonly logger = new Logger(ResenaService.name);
  constructor(private readonly prisma: PrismaService) {}

  private s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });


  async create(createResenaDto: CreateResenaDto, file?: Express.Multer.File) {
    let fotoPrincipal ='https://via.placeholder.com/150'; 
    // Subir la imagen a AWS S3 si se proporciona
    if (file) {
      try {
        const bucketName = process.env.S3_BUCKET_NAME;
        if (!bucketName) {
          throw new Error('La variable de entorno S3_BUCKET_NAME no está definida');
        }

        const params = {
          Bucket: bucketName,
          Key: `resenas/${Date.now()}_${file.originalname}`, // Nombre único para la imagen
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const uploadResult = await this.s3.upload(params).promise();
        fotoPrincipal = uploadResult.Location; // URL pública de la imagen
        this.logger.log(`Imagen subida a S3: ${fotoPrincipal}`);
      } catch (error) {
        this.logger.error(`Error al subir la imagen a S3: ${error.message}`);
        throw new BadRequestException('Error al subir la imagen');
      }
    }

    // Crear la reseña en la base de datos
    const resena = await this.prisma.resena.create({
      data: {
        ...createResenaDto,
        fotoPrincipal, // Asignar la URL de la imagen (o null si no hay imagen)
      },
    });

    this.logger.log(`Reseña creada: ${JSON.stringify(resena)}`);
    return resena;
  }

  async findAll() {
    return this.prisma.resena.findMany();
  }

  async findOne(id: number) {
    const resena = await this.prisma.resena.findUnique({
      where: { id },
    });

    if (!resena) {
      throw new NotFoundException(`Reseña con ID ${id} no encontrada`);
    }

    return resena;
  }

  async update(id: number, updateResenaDto: UpdateResenaDto) {
    const data = {
      ...updateResenaDto,
      fotoPrincipal: updateResenaDto.fotoPrincipal ?? undefined, // Convertir null a undefined
    };

    return this.prisma.resena.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    const resena = await this.prisma.resena.findUnique({
      where: { id },
    });

    if (!resena) {
      throw new NotFoundException(`Reseña con ID ${id} no encontrada`);
    }

    return this.prisma.resena.delete({
      where: { id },
    });
  }
}