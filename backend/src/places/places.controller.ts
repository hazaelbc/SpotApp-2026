import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  InternalServerErrorException,
  BadRequestException,
  Param,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { PlacesService } from './places.service';
import { PrismaService } from '../../prisma/prisma.service';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { memoryStorage } from 'multer';

@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService, private readonly prisma: PrismaService) {}

  // GET /places?bbox=south,west,north,east&categories=restaurant,cafe,supermarket
  @Get()
  async getPlaces(@Query('bbox') bbox: string, @Query('categories') categories?: string) {
    const categoryList = categories ? categories.split(',').map(k => k.trim()) : undefined;
    return this.placesService.fetchPOIs(bbox, categoryList);
  }

  // GET /places/db - devuelve places almacenados en la BD (para el frontend)
  // Opcional: creatorId para filtrar por creador
  @Get('db')
  async getAllPlacesFromDb(@Query('creatorId') creatorId?: string) {
    const parsed = Number.parseInt(String(creatorId ?? ''), 10);
    const filterId = Number.isFinite(parsed) ? parsed : undefined;
    return this.placesService.getAllPlacesFromDb(filterId);
  }

  // GET /places/by-creator/:creatorId - devuelve places creados por un usuario
  @Get('by-creator/:creatorId')
  async getPlacesByCreator(@Param('creatorId', ParseIntPipe) creatorId: number) {
    return this.placesService.getPlacesByCreator(creatorId);
  }

  // GET /places/last-rated?userId=X&limit=3 - últimos lugares calificados por un usuario
  @Get('last-rated')
  async getLastRatedPlaces(
    @Query('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    const parsedUserId = Number.parseInt(String(userId ?? ''), 10);
    if (!Number.isFinite(parsedUserId)) return [];
    const parsedLimit = Number.parseInt(String(limit ?? ''), 10);
    const take = Number.isFinite(parsedLimit) ? parsedLimit : 3;
    return this.placesService.getLastRatedPlacesByUser(parsedUserId, take);
  }

  // GET /places/trending?limit=20 - lugares con más vistas ganadas en últimas 24h
  @Get('trending')
  async getTrendingPlaces(@Query('limit') limit?: string) {
    const parsedLimit = Number.parseInt(String(limit ?? ''), 10);
    const take = Number.isFinite(parsedLimit) ? parsedLimit : 20;
    return this.placesService.getTrendingPlacesLast24Hours(take);
  }

  // GET /places/route?olat=&olng=&dlat=&dlng= — proxy a OSRM para evitar CORS
  @Get('route')
  async getRoute(
    @Query('olat') olat: string,
    @Query('olng') olng: string,
    @Query('dlat') dlat: string,
    @Query('dlng') dlng: string,
  ) {
    const oLat = Number.parseFloat(olat);
    const oLng = Number.parseFloat(olng);
    const dLat = Number.parseFloat(dlat);
    const dLng = Number.parseFloat(dlng);

    if (![oLat, oLng, dLat, dLng].every(Number.isFinite)) {
      throw new BadRequestException('Parámetros de ruta inválidos');
    }

    const url = `https://router.project-osrm.org/route/v1/driving/${oLng},${oLat};${dLng},${dLat}?overview=full&geometries=geojson&steps=false`;

    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'SpotApp/1.0 (+https://render.com)' },
      });

      if (!res.ok) {
        throw new InternalServerErrorException(`OSRM request failed (${res.status})`);
      }

      const data = await res.json();
      return data;
    } catch (e) {
      if (e instanceof BadRequestException || e instanceof InternalServerErrorException) throw e;
      throw new InternalServerErrorException('OSRM request failed');
    }
  }

  // GET /places/:id - devuelve un place por id
  @Get(':id')
  async getPlaceById(@Param('id', ParseIntPipe) id: number) {
    return this.placesService.getPlaceById(id);
  }

  // POST /places/:id/view - incrementa el contador de vistas de un place
  @Post(':id/view')
  async registerView(@Param('id', ParseIntPipe) id: number) {
    return this.placesService.incrementViews(id);
  }

  // Debug: crear un place manualmente (útil para pruebas con Postman)
  @Post()
  @UseInterceptors(FileInterceptor('imagen', { storage: memoryStorage() }))
  async createPlace(@UploadedFile() uploadedImage: Express.Multer.File | undefined, @Body() body: any) {
    const {
      nombre,
      descripcion,
      categoria,
      imagen: imagenUrl,
      direccion,
      latitud,
      longitud,
      externalId,
      coverPhoto,
      fotos,
      creatorId,
    } = body ?? {};
    const storedImage =
      imagenUrl ||
      coverPhoto ||
      (uploadedImage
        ? `data:${uploadedImage.mimetype};base64,${uploadedImage.buffer.toString('base64')}`
        : null);

    // Use `any` cast to avoid TypeScript errors while Prisma client types are being regenerated
    let place: any;
    try {
      place = await this.prisma.place.create({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: {
          nombre: nombre || 'Lugar de prueba',
          descripcion: descripcion || null,
          categoria: categoria || null,
          imagen: storedImage,
          coverPhoto: coverPhoto || null,
          direccion: direccion || null,
          externalId: externalId || null,
          latitud: typeof latitud === 'number' ? latitud : (latitud ? parseFloat(latitud) : 0),
          longitud: typeof longitud === 'number' ? longitud : (longitud ? parseFloat(longitud) : 0),
          creatorId: Number.isFinite(Number(creatorId)) ? Number(creatorId) : null,
          fotos: fotos && Array.isArray(fotos) ? { create: fotos.map((u: string, i: number) => ({ url: u, orden: i })) } : undefined,
        } as any,
        include: { fotos: true } as any,
      });
    } catch (error: any) {
      console.error('Error creating place:', error);
      throw new InternalServerErrorException(error?.message || 'Unknown error');
    }

    // Normalizar salida para frontend
    const p: any = place;
    const out = {
      ...p,
      imagen: p.imagen || p.coverPhoto || null,
      fotos: Array.isArray(p.fotos) ? p.fotos.map((f: any) => f.url) : [],
      lat: (p.latitud !== undefined && p.latitud !== null) ? Number(p.latitud) : undefined,
      lng: (p.longitud !== undefined && p.longitud !== null) ? Number(p.longitud) : undefined,
    };

    return out;
  }
}
