import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import * as AWS from 'aws-sdk';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prismaService: PrismaService) {}

  // Configuración de AWS S3
  private s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
  });

  // Crear un usuario
  async create(createUserDto: CreateUserDto, file?: Express.Multer.File) {
    const emailExists = await this.prismaService.usuario.findUnique({
      where: { email: createUserDto.email },
    });

    if (emailExists) {
      this.logger.error(`El email ${createUserDto.email} ya existe`);
      throw new BadRequestException(`El email ${createUserDto.email} ya existe`);
    }

    let fotoPerfil = createUserDto.fotoPerfil || 'https://via.placeholder.com/150';

    // Subir la imagen a AWS S3 si se proporciona
    if (file) {
      try {
        const bucketName = process.env.S3_BUCKET_NAME;
        if (!bucketName) {
          throw new Error('La variable de entorno S3_BUCKET_NAME no está definida');
        }

        const params = {
          Bucket: bucketName,
          Key: `usuarios/${Date.now()}_${file.originalname}`, // Nombre único para la imagen
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        const uploadResult = await this.s3.upload(params).promise();
        fotoPerfil = uploadResult.Location; // URL pública de la imagen
        this.logger.log(`Imagen subida a S3:  ${fotoPerfil}`);
      } catch (error) {
        this.logger.error(`Error al subir la imagen a S3: ${error.message}`);
        throw new BadRequestException('Error al subir la imagen');
      }
    }

    // Crear el usuario en la base de datos
    const user = await this.prismaService.usuario.create({
      data: {
        ...createUserDto,
        provider: createUserDto.provider || 'local', // Por defecto 'local'
        emailVerificado: false, // Email no verificado al crear
        fotoPerfil,
      },
    });

    // Crear la ubicación opcional para el usuario
    try {
      const ubicacion = await this.prismaService.ubicacionOpcional.create({
        data: {
          usuario: { connect: { id: user.id } }, // Ajuste aquí
          latitud: 0.0,
          longitud: 0.0,
        },
      });
      this.logger.log(`Ubicación creada: ${JSON.stringify(ubicacion)}`);
    } catch (error) {
      this.logger.error(`Error al crear la ubicación: ${error.message}`);
    }

    return user; // Retornar el usuario creado
  }

  // Obtener todos los usuarios
  async findAll() {
    return this.prismaService.usuario.findMany();
  }

  // Obtener un usuario por email
  async findByEmail(email: string) {
    return this.prismaService.usuario.findUnique({
      where: { email },
    });
  }

  // Obtener un usuario por ID
  async findOne(id: number) {
    console.log('ID recibido:', id);
    if (!id) {
      throw new Error('ID no proporcionado');
    }

    return this.prismaService.usuario.findUnique({
      where: {
        id: id,
      },
    });
  }

  // Actualizar un usuario
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prismaService.usuario.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.prismaService.usuario.update({
      where: { id },
      data: updateUserDto,
    });
  }

  // Eliminar un usuario
  async remove(id: number) {
    const user = await this.prismaService.usuario.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.prismaService.usuario.delete({
      where: { id },
    });
  }

  // Obtener información básica de los usuarios
  async findBasic() {
    const usuarios = await this.prismaService.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        email: true,
        fotoPerfil: true,
        cover: true,
        lat: true,
        lng: true,
      },
    });

    return usuarios ?? [];
  }

  // Validar usuario con login tradicional (email + password)
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prismaService.usuario.findUnique({
      where: { email },
    });
  
    if (!user) {
      this.logger.warn(`Usuario no encontrado: ${email}`);
      return null;
    }

    // Verificar que sea un usuario de login tradicional
    if (user.provider !== 'local') {
      this.logger.warn(`Usuario ${email} registrado con ${user.provider}, no con email/password`);
      return null;
    }

    // Verificar que tenga contraseña (usuarios de Google no tienen)
    if (!user.contrasena) {
      this.logger.warn(`Usuario ${email} no tiene contraseña configurada`);
      return null;
    }
  
    // Validar contraseña
    if (user.contrasena !== password) {
      this.logger.warn(`Contraseña incorrecta para ${email}`);
      return null;
    }
  
    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      contrasena: user.contrasena,
      fotoPerfil: user.fotoPerfil,
      cover: user.cover ?? null,
    };
  }

  // Encontrar o crear usuario con Google OAuth
  async findOrCreateGoogleUser(googleProfile: any): Promise<User> {
    const { id: googleId, emails, displayName, photos } = googleProfile;
    const email = emails[0].value;
    const fotoPerfil = photos?.[0]?.value || 'https://via.placeholder.com/150';

    // Buscar usuario existente por googleId
    let user = await this.prismaService.usuario.findUnique({
      where: { googleId },
    });

    if (user) {
      this.logger.log(`Usuario de Google existente: ${email}`);
      return {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        contrasena: user.contrasena,
        fotoPerfil: user.fotoPerfil,
        cover: user.cover ?? null,
      };
    }

    // Buscar usuario existente por email (vinculación de cuentas)
    user = await this.prismaService.usuario.findUnique({
      where: { email },
    });

    if (user) {
      // Vincular cuenta existente con Google
      this.logger.log(`Vinculando cuenta existente ${email} con Google`);
      user = await this.prismaService.usuario.update({
        where: { email },
        data: {
          googleId,
          provider: 'google',
          emailVerificado: true,
          fotoPerfil: fotoPerfil || user.fotoPerfil,
        },
      });
    } else {
      // Crear nuevo usuario de Google
      this.logger.log(`Creando nuevo usuario de Google: ${email}`);
      user = await this.prismaService.usuario.create({
        data: {
          nombre: displayName,
          email,
          googleId,
          provider: 'google',
          emailVerificado: true,
          fotoPerfil,
          contrasena: null, // Usuarios de Google no tienen contraseña
        },
      });

      // Crear ubicación opcional para el nuevo usuario
      try {
        await this.prismaService.ubicacionOpcional.create({
          data: {
            usuario: { connect: { id: user.id } },
            latitud: 0.0,
            longitud: 0.0,
          },
        });
        this.logger.log(`Ubicación creada para usuario de Google: ${email}`);
      } catch (error) {
        this.logger.error(`Error al crear ubicación para usuario de Google: ${error.message}`);
      }
    }

    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      contrasena: user.contrasena,
      fotoPerfil: user.fotoPerfil,
      cover: user.cover ?? null,
    };
  }
}