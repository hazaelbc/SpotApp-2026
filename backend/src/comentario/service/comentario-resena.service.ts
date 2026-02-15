import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateComentarioResenaDto } from '../dto/create-comentario-resena.dto';
import { UpdateComentarioResenaDto } from '../dto/update-comentario-resena.dto';

@Injectable()
export class ComentarioResenaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createComentarioResenaDto: CreateComentarioResenaDto) {
    const { usuarioId, resenaId, comentario } = createComentarioResenaDto;

    // Verifica que el usuario exista
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { nombre: true, fotoPerfil: true },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    // Crea el comentario
    const nuevoComentario = await this.prisma.comentariosResena.create({
      data: {
        resenaId,
        usuarioId,
        comentario,
      },
    });

    // Devuelve el comentario con la información del usuario
   return this.prisma.comentariosResena.findUnique({
      where: { id: nuevoComentario.id },
      include: {
        usuario: {
          select: {
            nombre: true,
            fotoPerfil: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.comentariosResena.findMany({
      include: {
        usuario: {
          select: { nombre: true, fotoPerfil: true },
        },
      },
    });
  }

  async findByResenaId(resenaId: number) {
    return this.prisma.comentariosResena.findMany({
      where: { resenaId: Number(resenaId) }, // Asegúrate de que sea un número
      include: {
        usuario: {
          select: {
            nombre: true,
            fotoPerfil: true,
          },
        },
      },
    });
  }
  
  async findOne(id: number) {
    const comentario = await this.prisma.comentariosResena.findUnique({
      where: { id },
    });

    if (!comentario) {
      throw new NotFoundException(`Comentario con ID ${id} no encontrado`);
    }

    return comentario;
  }

  async update(id: number, updateComentarioResenaDto: UpdateComentarioResenaDto) {
    const comentario = await this.prisma.comentariosResena.findUnique({
      where: { id },
    });

    if (!comentario) {
      throw new NotFoundException(`Comentario con ID ${id} no encontrado`);
    }

    return this.prisma.comentariosResena.update({
      where: { id },
      data: updateComentarioResenaDto,
    });
  }

  async remove(id: number) {
    const comentario = await this.prisma.comentariosResena.findUnique({
      where: { id },
    });

    if (!comentario) {
      throw new NotFoundException(`Comentario con ID ${id} no encontrado`);
    }

    return this.prisma.comentariosResena.delete({
      where: { id },
    });
  }
}