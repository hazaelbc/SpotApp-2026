import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUserUbicacionDto } from '../dto/userUbicacionDtos/create-userUbicacion.dto';
import { UpdateUserUbicacionDto } from '../dto/userUbicacionDtos/update-userUbicacion.dto';

@Injectable()
export class UserUbicacionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserUbicacionDto: CreateUserUbicacionDto) {
    return this.prisma.ubicacionOpcional.create({
      data: {
        ...createUserUbicacionDto,
        usuario: { connect: { id: createUserUbicacionDto.usuarioId } }, // Ajuste aquí
      },
    });
  }

  async findAll() {
    return this.prisma.ubicacionOpcional.findMany();
  }

  async findOne(id: number) {
    if (!id) {
      throw new Error('El ID es requerido para buscar la ubicación.');
    }
  
    return this.prisma.ubicacionOpcional.findUnique({
      where: { id },
    });
  }

  async findOneByUsuarioId(usuarioId: number) {
    return this.prisma.ubicacionOpcional.findFirst({
      where: {
        usuario: { id: usuarioId }, // Ajuste aquí
      },
    });
  }

  // async update(id: number, updateUserUbicacionDto: UpdateUserUbicacionDto) {
  //   return this.prisma.ubicacionOpcional.update({
  //     where: { id },
  //     data: updateUserUbicacionDto,
  //   });
  // }

  async update(id: number, updateUserUbicacionDto: { latitud: number; longitud: number }) {
    return this.prisma.ubicacionOpcional.update({
      where: { id }, // Filtra por el ID del usuario (que es el mismo en ambas tablas)
      data: {
        latitud: updateUserUbicacionDto.latitud,
        longitud: updateUserUbicacionDto.longitud,
      }, // Actualiza los campos de latitud y longitud
    });
  }

  async remove(id: number) {
    return this.prisma.ubicacionOpcional.delete({ where: { id } });
  }

  
}