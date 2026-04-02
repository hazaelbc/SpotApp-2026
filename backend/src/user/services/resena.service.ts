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
    let fotoPrincipal: string = (createResenaDto as any).fotoPrincipal || 'https://via.placeholder.com/150';
    // Subir la imagen a AWS S3 si se proporciona (tiene prioridad sobre URL en body)
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
      include: { fotos: true },
    });

    this.logger.log(`Reseña creada: ${JSON.stringify(resena)}`);
    return this.normalize(resena);
  }

  async findAll() {
    const list = await this.prisma.resena.findMany({ include: { fotos: true } });
    return list.map(r => this.normalize(r));
  }

  async findOne(id: number) {
    const resena = await this.prisma.resena.findUnique({ where: { id }, include: { fotos: true } });
    if (!resena) {
      throw new NotFoundException(`Reseña con ID ${id} no encontrada`);
    }
    return this.normalize(resena);
  }

  async update(id: number, updateResenaDto: UpdateResenaDto) {
    const data = {
      ...updateResenaDto,
      fotoPrincipal: updateResenaDto.fotoPrincipal ?? undefined, // Convertir null a undefined
    };

    const resena = await this.prisma.resena.update({ where: { id }, data, include: { fotos: true } });
    return this.normalize(resena);
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

  // Normalize resena object for frontend: map lat/lng and images
  private normalize(resena: any) {
    const fotos = Array.isArray(resena.fotos) ? resena.fotos.map((f: any) => f.url || f) : [];
    return {
      ...resena,
      lat: (resena.latitud !== undefined && resena.latitud !== null) ? Number(resena.latitud) : undefined,
      lng: (resena.longitud !== undefined && resena.longitud !== null) ? Number(resena.longitud) : undefined,
      imagen: resena.fotoPrincipal || resena.imagen || null,
      fotos,
    };
  }
}