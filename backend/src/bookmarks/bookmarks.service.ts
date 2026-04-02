import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizePlace(place: any) {
    return {
      id: place.id,
      nombre: place.nombre,
      categoria: place.categoria,
      descripcion: place.descripcion,
      imagen: place.imagen || place.coverPhoto || null,
      fotos: Array.isArray(place.fotos) ? place.fotos.map((f: any) => f.url) : [],
      calificacion: place.calificacion,
      vistas: place.vistas,
      lat: place.latitud ?? place.lat,
      lng: place.longitud ?? place.lng,
      direccion: place.direccion ?? null,
    };
  }

  private async assertUserAndPlace(usuarioId: number, placeId: number) {
    const [usuario, place] = await Promise.all([
      this.prisma.usuario.findUnique({ where: { id: usuarioId }, select: { id: true } }),
      this.prisma.place.findUnique({ where: { id: placeId }, select: { id: true } }),
    ]);

    if (!usuario) throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    if (!place) throw new NotFoundException(`Place con ID ${placeId} no encontrado`);
  }

  async getSaved(usuarioId: number) {
    const rows = await this.prisma.saved.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      include: { place: { include: { fotos: true } as any } },
    });

    return rows.map((r: any) => ({
      id: r.id,
      createdAt: r.createdAt,
      usuarioId: r.usuarioId,
      placeId: r.placeId,
      place: this.normalizePlace(r.place),
    }));
  }

  async getFavorites(usuarioId: number) {
    const rows = await (this.prisma as any).favorite.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
      include: { place: { include: { fotos: true } as any } },
    });

    return rows.map((r: any) => ({
      id: r.id,
      createdAt: r.createdAt,
      usuarioId: r.usuarioId,
      placeId: r.placeId,
      place: this.normalizePlace(r.place),
    }));
  }

  async status(usuarioId: number, placeId: number) {
    const [saved, favorited] = await Promise.all([
      this.prisma.saved.findUnique({ where: { usuarioId_placeId: { usuarioId, placeId } } }),
      (this.prisma as any).favorite.findUnique({ where: { usuarioId_placeId: { usuarioId, placeId } } }),
    ]);

    return {
      saved: !!saved,
      favorited: !!favorited,
    };
  }

  async toggleSaved(usuarioId: number, placeId: number) {
    await this.assertUserAndPlace(usuarioId, placeId);

    const existing = await this.prisma.saved.findUnique({
      where: { usuarioId_placeId: { usuarioId, placeId } },
    });

    if (existing) {
      await this.prisma.saved.delete({ where: { id: existing.id } });
      return { active: false };
    }

    const created = await this.prisma.saved.create({
      data: { usuarioId, placeId },
      include: { place: { include: { fotos: true } as any } },
    });

    return {
      active: true,
      item: {
        id: created.id,
        createdAt: created.createdAt,
        usuarioId: created.usuarioId,
        placeId: created.placeId,
        place: this.normalizePlace((created as any).place),
      },
    };
  }

  async toggleFavorite(usuarioId: number, placeId: number) {
    await this.assertUserAndPlace(usuarioId, placeId);

    const existing = await (this.prisma as any).favorite.findUnique({
      where: { usuarioId_placeId: { usuarioId, placeId } },
    });

    if (existing) {
      await (this.prisma as any).favorite.delete({ where: { id: existing.id } });
      return { active: false };
    }

    const created = await (this.prisma as any).favorite.create({
      data: { usuarioId, placeId },
      include: { place: { include: { fotos: true } as any } },
    });

    return {
      active: true,
      item: {
        id: created.id,
        createdAt: created.createdAt,
        usuarioId: created.usuarioId,
        placeId: created.placeId,
        place: this.normalizePlace((created as any).place),
      },
    };
  }

  async removeSaved(usuarioId: number, placeId: number) {
    const existing = await this.prisma.saved.findUnique({
      where: { usuarioId_placeId: { usuarioId, placeId } },
    });
    if (!existing) return { deleted: false };

    await this.prisma.saved.delete({ where: { id: existing.id } });
    return { deleted: true };
  }

  async removeFavorite(usuarioId: number, placeId: number) {
    const existing = await (this.prisma as any).favorite.findUnique({
      where: { usuarioId_placeId: { usuarioId, placeId } },
    });
    if (!existing) return { deleted: false };

    await (this.prisma as any).favorite.delete({ where: { id: existing.id } });
    return { deleted: true };
  }
}
