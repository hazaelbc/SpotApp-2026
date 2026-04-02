import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUserUbicacionDto } from '../dto/userUbicacionDtos/create-userUbicacion.dto';
import { UpdateUserUbicacionDto } from '../dto/userUbicacionDtos/update-userUbicacion.dto';

@Injectable()
export class UserUbicacionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserUbicacionDto: CreateUserUbicacionDto) {
    const { latitud, longitud, usuarioId } = createUserUbicacionDto;
    const created = await this.prisma.ubicacionOpcional.create({
      data: {
        // La tabla `ubicaciones_opcionales` usa `id` como PK que coincide con `usuario.id`.
        // Prisma no permite la conexión anidada aquí por la forma del modelo, así que
        // asignamos directamente el `id` en el create.
        id: usuarioId,
        latitud: latitud ?? undefined,
        longitud: longitud ?? undefined,
      },
    });

    // Copiar lat/lng al usuario para lecturas simples
    if (latitud !== undefined || longitud !== undefined) {
      await this.prisma.usuario.update({ where: { id: usuarioId }, data: { lat: latitud ?? undefined, lng: longitud ?? undefined } });
    }

    return created;
  }

  async findAll() {
    return this.prisma.ubicacionOpcional.findMany();
  }

  async findOne(id: number) {
    if (!id) {
      throw new Error('El ID es requerido para buscar la ubicación.');
    }
  
    // Incluimos la relación al `usuario` para devolver también el `ubicacionLabel`
    const row = await this.prisma.ubicacionOpcional.findUnique({
      where: { id },
      include: { usuario: true },
    });

    if (!row) return null;

    return {
      id: row.id,
      latitud: row.latitud,
      longitud: row.longitud,
      ubicacionLabel: row.usuario?.ubicacionLabel ?? null,
    };
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

  async update(
    id: number,
    updateUserUbicacionDto: { latitud: number; longitud: number; ubicacionLabel?: string },
  ) {
    // Usamos upsert para crear la fila de ubicacionOpcional si no existe (id coincide con usuario.id)
    const { latitud, longitud, ubicacionLabel } = updateUserUbicacionDto;

    const ubicacion = await this.prisma.ubicacionOpcional.upsert({
      where: { id },
      create: {
        // Al crear, asignamos el id (que coincide con usuario.id) en lugar de usar
        // la relación anidada, que no es compatible con este patrón en Prisma.
        id,
        latitud: latitud ?? 0,
        longitud: longitud ?? 0,
      },
      update: {
        latitud: latitud ?? undefined,
        longitud: longitud ?? undefined,
      },
    });

    // Si el cliente envía un label amigable, también actualizamos el campo en Usuario
    if (ubicacionLabel !== undefined || latitud !== undefined || longitud !== undefined) {
      const data: any = {};
      if (ubicacionLabel !== undefined) data.ubicacionLabel = ubicacionLabel;
      if (latitud !== undefined) data.lat = latitud;
      if (longitud !== undefined) data.lng = longitud;
      await this.prisma.usuario.update({ where: { id }, data });
    }

    return ubicacion;
  }

  async remove(id: number) {
    return this.prisma.ubicacionOpcional.delete({ where: { id } });
  }

  
}