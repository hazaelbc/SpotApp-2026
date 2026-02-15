import { Module } from '@nestjs/common';
import { HistorialBusquedaService } from '../service/historial-busqueda.service';
import { HistorialBusquedaController } from '../controller/historial-busqueda.controller';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [HistorialBusquedaController],
  providers: [HistorialBusquedaService, PrismaService],
})
export class HistorialBusquedaModule {}