import { Module } from '@nestjs/common';
import { HistorialCalificacionesService } from '../service/historial-calificaciones.service';
import { HistorialCalificacionesController } from '../controller/historial-calificaciones.controller';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [HistorialCalificacionesController],
  providers: [HistorialCalificacionesService, PrismaService],
})
export class HistorialCalificacionesModule {}