import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateHistorialBusquedaDto } from '../dto/create-historial-busqueda.dto';
import { UpdateHistorialBusquedaDto } from '../dto/update-historial-busqueda.dto';

@Injectable()
export class HistorialBusquedaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createHistorialBusquedaDto: CreateHistorialBusquedaDto) {
    return this.prisma.historialBusqueda.create({
      data: createHistorialBusquedaDto,
    });
  }

  async findAll() {
    return this.prisma.historialBusqueda.findMany();
  }

  async findOne(id: number) {
    const historial = await this.prisma.historialBusqueda.findUnique({
      where: { id },
    });

    if (!historial) {
      throw new NotFoundException(`Historial con ID ${id} no encontrado`);
    }

    return historial;
  }

  async update(id: number, updateHistorialBusquedaDto: UpdateHistorialBusquedaDto) {
    const historial = await this.prisma.historialBusqueda.findUnique({
      where: { id },
    });

    if (!historial) {
      throw new NotFoundException(`Historial con ID ${id} no encontrado`);
    }

    return this.prisma.historialBusqueda.update({
      where: { id },
      data: updateHistorialBusquedaDto,
    });
  }

  async remove(id: number) {
    const historial = await this.prisma.historialBusqueda.findUnique({
      where: { id },
    });

    if (!historial) {
      throw new NotFoundException(`Historial con ID ${id} no encontrado`);
    }

    return this.prisma.historialBusqueda.delete({
      where: { id },
    });
  }
}