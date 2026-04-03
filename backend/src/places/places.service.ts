import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PlacesService {
  constructor(private readonly prisma: PrismaService) {}

  private OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

  private normalizePlaceOutput(p: any, calificacion?: number) {
    return {
      id: p.id,
      externalId: p.externalId,
      nombre: p.nombre,
      descripcion: p.descripcion,
      categoria: p.categoria,
      coverPhoto: p.coverPhoto,
      imagen: p.imagen || p.coverPhoto || null,
      fotos: Array.isArray(p.fotos) ? p.fotos.map((f: any) => f.url) : [],
      latitud: p.latitud,
      longitud: p.longitud,
      lat: p.latitud ?? p.lat,
      lng: p.longitud ?? p.lng,
      creatorId: p.creatorId,
      calificacion: Number.isFinite(calificacion) ? Number(calificacion) : p.calificacion,
      vistas: p.vistas,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  private async resolveAverageCommentRatingsByPlace(placeIds: number[], placesById: Map<number, any>): Promise<Map<number, number>> {
    if (!Array.isArray(placeIds) || placeIds.length === 0) return new Map();

    const nameToPlaceIds = new Map<string, number[]>();
    for (const placeId of placeIds) {
      const place = placesById.get(placeId);
      const key = String(place?.nombre || '').trim().toLowerCase();
      if (!key) continue;
      if (!nameToPlaceIds.has(key)) nameToPlaceIds.set(key, []);
      nameToPlaceIds.get(key)?.push(placeId);
    }

    const placeNames = Array.from(nameToPlaceIds.keys());

    const resenas = await this.prisma.resena.findMany({
      where: {
        OR: [
          { placeId: { in: placeIds } },
          ...(placeNames.length > 0 ? [{ nombreLugar: { in: placeNames, mode: 'insensitive' as any } }] : []),
        ],
      },
      select: {
        id: true,
        placeId: true,
        nombreLugar: true,
      },
    });

    if (!Array.isArray(resenas) || resenas.length === 0) return new Map();

    const resenaToPlaceId = new Map<number, number>();
    for (const r of resenas as any[]) {
      const directPlaceId = Number(r.placeId);
      if (Number.isFinite(directPlaceId) && placeIds.includes(directPlaceId)) {
        resenaToPlaceId.set(r.id, directPlaceId);
        continue;
      }

      const nameKey = String(r.nombreLugar || '').trim().toLowerCase();
      const candidates = nameToPlaceIds.get(nameKey) || [];
      if (candidates.length > 0) {
        resenaToPlaceId.set(r.id, candidates[0]);
      }
    }

    const resenaIds = Array.from(resenaToPlaceId.keys());
    if (resenaIds.length === 0) return new Map();

    const comentarios = await (this.prisma.comentariosResena as any).findMany({
      where: {
        resenaId: { in: resenaIds },
        rating: { not: null },
      },
      select: {
        resenaId: true,
        rating: true,
      },
    });

    const acc = new Map<number, { sum: number; count: number }>();
    for (const c of comentarios as any[]) {
      const placeId = resenaToPlaceId.get(c.resenaId);
      const rating = Number(c.rating);
      if (!placeId || !Number.isFinite(rating)) continue;
      const prev = acc.get(placeId) || { sum: 0, count: 0 };
      prev.sum += rating;
      prev.count += 1;
      acc.set(placeId, prev);
    }

    const avgByPlace = new Map<number, number>();
    for (const [placeId, v] of acc.entries()) {
      if (v.count > 0) avgByPlace.set(placeId, v.sum / v.count);
    }

    return avgByPlace;
  }

  async getPlaceById(id: number) {
    const p: any = await this.prisma.place.findUnique({ where: { id }, include: { fotos: true } as any });
    if (!p) return null;
    const avgMap = await this.resolveAverageCommentRatingsByPlace([p.id], new Map([[p.id, p]]));
    return this.normalizePlaceOutput(p, avgMap.get(p.id));
  }

  private haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  async getAllPlacesFromDb(creatorId?: number, userLat?: number, userLng?: number, radiusKm = 5) {
    const where = Number.isFinite(creatorId) ? { creatorId } : undefined;
    let places = await this.prisma.place.findMany({ where, include: { fotos: true } as any }) as any[];

    if (userLat != null && userLng != null) {
      places = places.filter((p: any) => {
        const lat = p.latitud ?? p.lat;
        const lng = p.longitud ?? p.lng;
        if (!lat || !lng) return false;
        return this.haversineKm(userLat, userLng, Number(lat), Number(lng)) <= radiusKm;
      });
    }

    const placeMap = new Map(places.map((p: any) => [p.id, p]));
    const placeIds = places.map((p: any) => p.id);
    const avgByPlace = await this.resolveAverageCommentRatingsByPlace(placeIds, placeMap);

    return places.map((p: any) => this.normalizePlaceOutput(p, avgByPlace.get(p.id)));
  }

  async getPlacesByCreator(creatorId: number) {
    if (!Number.isFinite(creatorId)) return [];
    return this.getAllPlacesFromDb(Number(creatorId));
  }

  /**
   * Últimos `limit` places donde el usuario escribió un comentario.
   * Tablas usadas: comentarios_resena, places, usuarios (id viene del contexto).
   *
   * 1. comentarios_resena WHERE usuarioId = X AND deletedAt IS NULL ORDER BY fecha DESC
   * 2. Deduplicar resenaId, quedarse con los primeros `limit`
   * 3. places WHERE id IN (esos resenaIds)
   */
  async getLastRatedPlacesByUser(userId: number, limit = 3): Promise<any[]> {
    if (!Number.isFinite(userId)) return [];

    // Paso 1: últimos comentarios del usuario, ordenados por fecha DESC
    const comentarios = await this.prisma.comentariosResena.findMany({
      where: {
        usuarioId: userId,
        deletedAt: null,
      },
      orderBy: { fecha: 'desc' },
      select: { resenaId: true },
    }) as any[];

    if (!comentarios.length) return [];

    // Paso 2: deduplicar resenaId manteniendo orden, tomar los primeros `limit`
    const seen = new Set<number>();
    const resenaIds: number[] = [];
    for (const c of comentarios) {
      const rid = Number(c.resenaId);
      if (!seen.has(rid)) {
        seen.add(rid);
        resenaIds.push(rid);
        if (resenaIds.length >= limit) break;
      }
    }

    // Paso 3: buscar en places donde places.id = resenaId
    const places = await this.prisma.place.findMany({
      where: { id: { in: resenaIds } },
      include: { fotos: true } as any,
    }) as any[];

    // Devolver en el mismo orden que los comentarios (más reciente primero)
    const placeMap = new Map(places.map((p: any) => [p.id, p]));
    return resenaIds
      .map((rid) => {
        const p = placeMap.get(rid);
        if (!p) return null;
        return this.normalizePlaceOutput(p);
      })
      .filter(Boolean);
  }

  async incrementViews(placeId: number): Promise<{ id: number; vistas: number }> {
    const updated = await this.prisma.$transaction(async (tx) => {
      await (tx as any).placeView.create({
        data: { placeId },
      });

      return tx.place.update({
        where: { id: placeId },
        data: { vistas: { increment: 1 } },
        select: { id: true, vistas: true },
      });
    });

    return updated;
  }

  /**
   * Trending score con decaimiento temporal — igual al approach de redes sociales.
   * Cada interacción reciente vale más que una vieja:
   *   decay(t) = 1 / (horasAtrás + 2)^1.5
   *
   * Score final por place:
   *   score = Σ views_i * decay(t_i) + Σ comments_j * 3 * decay(t_j)
   *
   * Las vistas tienen peso 1, los comentarios peso 3 (interacción más intencional).
   * Ventana máxima: 48 horas.
   */
  async getTrendingPlacesLast24Hours(limit = 20): Promise<any[]> {
    const take = Number.isFinite(limit) ? Math.max(1, Math.min(Number(limit), 200)) : 20;
    const now = new Date();
    const since = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Función de decay: cuanto más reciente, más peso
    const decay = (date: Date): number => {
      const hoursAgo = (now.getTime() - date.getTime()) / (1000 * 3600);
      return 1 / Math.pow(hoursAgo + 2, 1.5);
    };

    // 1. Views recientes con timestamp individual
    const recentViews = await (this.prisma as any).placeView.findMany({
      where: { createdAt: { gte: since } },
      select: { placeId: true, createdAt: true },
    });

    // 2. Comentarios recientes con su placeId (via resena)
    const recentComments = await (this.prisma as any).comentariosResena.findMany({
      where: {
        fecha: { gte: since },
        deletedAt: null,
        resena: { placeId: { not: null } },
      },
      select: { fecha: true, resena: { select: { placeId: true } } },
    });

    // 3. Calcular score por place
    const scoreMap = new Map<number, number>();

    for (const v of recentViews) {
      const prev = scoreMap.get(v.placeId) ?? 0;
      scoreMap.set(v.placeId, prev + decay(new Date(v.createdAt)));
    }

    for (const c of recentComments) {
      const placeId = c.resena?.placeId;
      if (!placeId) continue;
      const prev = scoreMap.get(placeId) ?? 0;
      scoreMap.set(placeId, prev + 3 * decay(new Date(c.fecha)));
    }

    if (scoreMap.size === 0) return [];

    // 4. Ordenar por score y tomar top N
    const ranked = [...scoreMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, take);

    const placeIds = ranked.map(([id]) => id);
    const places = await this.prisma.place.findMany({
      where: { id: { in: placeIds } },
      include: { fotos: true } as any,
    });

    const placeMap = new Map(places.map((p: any) => [p.id, p]));
    const avgByPlace = await this.resolveAverageCommentRatingsByPlace(placeIds, placeMap);

    // Contar vistas en última 1h y 24h para el frontend
    const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const viewsBy1h = new Map<number, number>();
    const viewsBy24h = new Map<number, number>();
    for (const v of recentViews) {
      const t = new Date(v.createdAt);
      if (t >= oneHourAgo) viewsBy1h.set(v.placeId, (viewsBy1h.get(v.placeId) ?? 0) + 1);
      if (t >= oneDayAgo) viewsBy24h.set(v.placeId, (viewsBy24h.get(v.placeId) ?? 0) + 1);
    }

    return ranked
      .map(([placeId, score]) => {
        const p = placeMap.get(placeId);
        if (!p) return null;
        return {
          ...this.normalizePlaceOutput(p, avgByPlace.get(p.id)),
          trendingScore: Math.round(score * 100) / 100,
          vistasUltimas1h: viewsBy1h.get(placeId) ?? 0,
          vistasUltimas24h: viewsBy24h.get(placeId) ?? 0,
        };
      })
      .filter(Boolean);
  }

  // Query Overpass with a bbox (south,west,north,east) and an array of categories (e.g. ['restaurant','cafe','supermarket'])
  async fetchPOIs(bbox: string, categories: string[] = []): Promise<any[]> {
    // basic bbox validation: four comma-separated numbers
    const parts = bbox.split(',').map((p) => p.trim());
    if (parts.length !== 4 || parts.some((p) => Number.isNaN(Number(p)))) {
      throw new HttpException('Invalid bbox parameter', HttpStatus.BAD_REQUEST);
    }

    // prevent huge queries: limit bbox span to ~2 degrees each direction
    const south = parseFloat(parts[0]);
    const west = parseFloat(parts[1]);
    const north = parseFloat(parts[2]);
    const east = parseFloat(parts[3]);
    if (Math.abs(north - south) > 2 || Math.abs(east - west) > 2) {
      throw new HttpException('BBox too large', HttpStatus.BAD_REQUEST);
    }

    // sanitize categories
    const safeCategories = (categories || []).map(c => c.replace(/[^a-zA-Z0-9_\-]/g, '')).filter(Boolean);

    // map friendly category names to OSM tag filters
    const categoryToFilters = (cat: string) => {
      const lower = cat.toLowerCase();
      switch (lower) {
        case 'restaurant': return [{ k: 'amenity', v: 'restaurant' }];
        case 'cafe': return [{ k: 'amenity', v: 'cafe' }];
        case 'bar': return [{ k: 'amenity', v: 'bar' }];
        case 'supermarket': return [{ k: 'shop', v: 'supermarket' }];
        case 'convenience': return [{ k: 'shop', v: 'convenience' }];
        case 'fuel': return [{ k: 'amenity', v: 'fuel' }];
        default:
          // fallback: try amenity and shop with the category as value
          return [{ k: 'amenity', v: lower }, { k: 'shop', v: lower }];
      }
    };

    const filters = safeCategories.length ? safeCategories.flatMap(categoryToFilters) : [
      { k: 'amenity', v: 'restaurant' },
      { k: 'amenity', v: 'cafe' },
      { k: 'shop', v: 'supermarket' }
    ];

    // Build Overpass QL parts per filter
    const makeFilter = (f: {k:string,v:string}) => `["${f.k}"="${f.v}"]`;
    const nodeQueries = filters.map(f => `node${makeFilter(f)}(${south},${west},${north},${east});`).join('\n  ');
    const wayQueries = filters.map(f => `way${makeFilter(f)}(${south},${west},${north},${east});`).join('\n  ');
    const relQueries = filters.map(f => `relation${makeFilter(f)}(${south},${west},${north},${east});`).join('\n  ');

    const query = `\n[out:json][timeout:25];\n(\n  ${nodeQueries}\n  ${wayQueries}\n  ${relQueries}\n);\nout center;`;

    try {
      // simple retry: attempt up to 2 times for transient Overpass/network errors
      let res = await fetch(this.OVERPASS_URL, { method: 'POST', body: query });
      if (!res.ok) {
        const txt1 = await res.text().catch(() => '');
        console.warn('Overpass first attempt non-ok', res.status, txt1);
        // brief delay then retry once
        await new Promise(r => setTimeout(r, 400));
        res = await fetch(this.OVERPASS_URL, { method: 'POST', body: query });
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          console.error('Overpass error after retry', res.status, txt);
          return [];
        }
      }
      const data = await res.json();

      // convert to simplified GeoJSON-like features
      const features = (data.elements || []).map(el => {
        let coords: [number, number] | null = null;
        if (el.type === 'node') coords = [el.lon as number, el.lat as number];
        else if (el.type === 'way' || el.type === 'relation') {
          if (el.center) coords = [el.center.lon as number, el.center.lat as number];
        }
        if (!coords) return null;
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: coords },
          properties: { id: el.id, tags: el.tags || {}, osm_type: el.type }
        };
      }).filter(Boolean);

      return features;
    } catch (err) {
      console.error('PlacesService.fetchPOIs error:', err?.message || err);
      // Bubble up validation/http exceptions, otherwise return empty array to avoid 500 on transient Overpass/network errors
      if (err instanceof HttpException) throw err;
      return [];
    }
  }
}
