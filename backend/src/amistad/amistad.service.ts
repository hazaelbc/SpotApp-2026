import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EstadoSolicitud } from '@prisma/client';

@Injectable()
export class AmistadService {
  constructor(private readonly prisma: PrismaService) {}

  async enviarSolicitud(fromId: number, toId: number) {
    if (fromId === toId) throw new BadRequestException('No puedes enviarte una solicitud a ti mismo');

    const existente = await this.prisma.solicitudAmistad.findUnique({
      where: { fromId_toId: { fromId, toId } },
    });

    if (existente) {
      if (existente.estado === EstadoSolicitud.PENDIENTE) {
        throw new BadRequestException('Ya existe una solicitud pendiente');
      }
      // Reactivar si fue cancelada/rechazada — y crear notificación de nuevo
      return this.prisma.$transaction(async (tx) => {
        const s = await tx.solicitudAmistad.update({
          where: { id: existente.id },
          data: { estado: EstadoSolicitud.PENDIENTE },
        });
        await tx.notification.create({
          data: {
            usuarioId: toId,
            tipo: 'solicitud_amistad',
            data: { fromId, solicitudId: s.id },
          },
        });
        return s;
      });
    }

    const solicitud = await this.prisma.$transaction(async (tx) => {
      const s = await tx.solicitudAmistad.create({ data: { fromId, toId } });
      await tx.notification.create({
        data: {
          usuarioId: toId,
          tipo: 'solicitud_amistad',
          data: { fromId, solicitudId: s.id },
        },
      });
      return s;
    });

    return solicitud;
  }

  async cancelarSolicitud(fromId: number, toId: number) {
    const solicitud = await this.prisma.solicitudAmistad.findUnique({
      where: { fromId_toId: { fromId, toId } },
    });
    if (!solicitud) throw new NotFoundException('Solicitud no encontrada');

    return this.prisma.solicitudAmistad.update({
      where: { id: solicitud.id },
      data: { estado: EstadoSolicitud.CANCELADA },
    });
  }

  async aceptarSolicitud(solicitudId: number, userId: number) {
    const solicitud = await this.prisma.solicitudAmistad.findUnique({ where: { id: solicitudId } });
    if (!solicitud || solicitud.toId !== userId) throw new NotFoundException('Solicitud no encontrada');

    const [updated] = await this.prisma.$transaction([
      this.prisma.solicitudAmistad.update({
        where: { id: solicitudId },
        data: { estado: EstadoSolicitud.ACEPTADA },
      }),
      this.prisma.notification.create({
        data: {
          usuarioId: solicitud.fromId,
          tipo: 'solicitud_aceptada',
          data: { fromId: userId },
        },
      }),
    ]);

    return updated;
  }

  async rechazarSolicitud(solicitudId: number, userId: number) {
    const solicitud = await this.prisma.solicitudAmistad.findUnique({ where: { id: solicitudId } });
    if (!solicitud || solicitud.toId !== userId) throw new NotFoundException('Solicitud no encontrada');

    return this.prisma.solicitudAmistad.update({
      where: { id: solicitudId },
      data: { estado: EstadoSolicitud.RECHAZADA },
    });
  }

  /** Solicitudes recibidas pendientes (para el panel de notificaciones) */
  async getSolicitudesRecibidas(userId: number) {
    return this.prisma.solicitudAmistad.findMany({
      where: { toId: userId, estado: EstadoSolicitud.PENDIENTE },
      include: {
        from: { select: { id: true, nombre: true, fotoPerfil: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Estado de todas las solicitudes enviadas + amistades recibidas (para mapear estado en lista) */
  async getEstadosEnviados(userId: number) {
    const enviadas = await this.prisma.solicitudAmistad.findMany({
      where: { fromId: userId },
      select: { toId: true, estado: true },
    });

    // Solicitudes que OTROS me enviaron y están ACEPTADAS (soy amigo pero no fui el fromId)
    const recibidasAceptadas = await this.prisma.solicitudAmistad.findMany({
      where: { toId: userId, estado: EstadoSolicitud.ACEPTADA },
      select: { fromId: true, estado: true },
    });

    const recibidasMapped = recibidasAceptadas.map((r) => ({
      toId: r.fromId,
      estado: r.estado,
    }));

    return [...enviadas, ...recibidasMapped];
  }

  /** Eliminar amistad confirmada (cualquier dirección) */
  async eliminarAmistad(userAId: number, userBId: number) {
    const solicitud = await this.prisma.solicitudAmistad.findFirst({
      where: {
        estado: EstadoSolicitud.ACEPTADA,
        OR: [
          { fromId: userAId, toId: userBId },
          { fromId: userBId, toId: userAId },
        ],
      },
    });
    if (!solicitud) throw new NotFoundException('Amistad no encontrada');
    return this.prisma.solicitudAmistad.update({
      where: { id: solicitud.id },
      data: { estado: EstadoSolicitud.CANCELADA },
    });
  }

  /** Todos los amigos confirmados (ACEPTADA en cualquier dirección) */
  async getAmigos(userId: number) {
    const solicitudes = await this.prisma.solicitudAmistad.findMany({
      where: {
        estado: 'ACEPTADA',
        OR: [{ fromId: userId }, { toId: userId }],
      },
      include: {
        from: { select: { id: true, nombre: true, fotoPerfil: true, lat: true, lng: true } },
        to:   { select: { id: true, nombre: true, fotoPerfil: true, lat: true, lng: true } },
      },
    });

    return solicitudes.map((s) => (s.fromId === userId ? s.to : s.from));
  }
}
