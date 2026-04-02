import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateComentarioResenaDto } from '../dto/create-comentario-resena.dto';
import { UpdateComentarioResenaDto } from '../dto/update-comentario-resena.dto';

@Injectable()
export class ComentarioResenaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createComentarioResenaDto: CreateComentarioResenaDto) {
    const { usuarioId, resenaId, comentario, rating } = createComentarioResenaDto;

    // Verifica que el usuario exista
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { nombre: true, fotoPerfil: true },
    });

    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    // Crea el comentario
    const nuevoComentario = await (this.prisma.comentariosResena as any).create({
      data: {
        resenaId,
        usuarioId,
        comentario,
        rating,
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
      where: { resenaId: Number(resenaId) },
      include: {
        usuario: {
          select: { nombre: true, fotoPerfil: true },
        },
      },
    });
  }

  // Buscar comentarios por placeId (todos los comentarios cuyas reseñas pertenecen a un place)
  async findByPlaceId(placeId: number) {
    return this.prisma.comentariosResena.findMany({
      where: {
        resena: {
          is: {
            placeId: Number(placeId),
          },
        },
      },
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
  
  async findByUsuarioId(usuarioId: number) {
    // resenaId stores placeId directly — no resena FK join
    const comentarios = await this.prisma.comentariosResena.findMany({
      where: { usuarioId: Number(usuarioId) },
      include: { usuario: { select: { nombre: true, fotoPerfil: true } } },
      orderBy: { fecha: 'desc' },
    }) as any[];

    const placeIds = [...new Set(comentarios.map((c: any) => c.resenaId).filter(Boolean))] as number[];
    const places = placeIds.length
      ? await this.prisma.place.findMany({
          where: { id: { in: placeIds } },
          select: { id: true, nombre: true, categoria: true, imagen: true, descripcion: true },
        })
      : [];
    const placeMap = new Map(places.map((p: any) => [p.id, p]));

    return comentarios.map((c: any) => ({
      ...c,
      resena: {
        placeId: c.resenaId,
        nombreLugar: placeMap.get(c.resenaId)?.nombre ?? 'Lugar',
        place: placeMap.get(c.resenaId) ?? null,
      },
    }));
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