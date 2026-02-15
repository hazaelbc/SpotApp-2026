import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateHistorialCalificacionesDto } from '../dto/create-historial-calificaciones.dto';
import { UpdateHistorialCalificacionesDto } from '../dto/update-historial-calificaciones.dto';

@Injectable()
export class HistorialCalificacionesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createHistorialCalificacionesDto: CreateHistorialCalificacionesDto) {
    const { resenaId, calificacion } = createHistorialCalificacionesDto;
  
    // Registrar la calificación en HistorialCalificaciones
    const nuevaCalificacion = await this.prisma.historialCalificaciones.create({
      data: createHistorialCalificacionesDto,
    });
  
    // Obtener los datos actuales de la reseña
    const resena = await this.prisma.resena.findUnique({
      where: { id: resenaId },
      select: {
        sumaCalificaciones: true,
        totalCalificaciones: true,
      },
    });
  
    if (!resena) {
      throw new NotFoundException(`Reseña con ID ${resenaId} no encontrada`);
    }
  
    // Calcular el nuevo promedio
    const nuevaSuma = resena.sumaCalificaciones + calificacion;
    const nuevoTotal = resena.totalCalificaciones + 1;
    const promedio = nuevaSuma / nuevoTotal;
  
    // Redondear el promedio
    const promedioRedondeado =
      promedio % 1 <= 0.5 ? Math.floor(promedio) : Math.ceil(promedio);
  
    // Actualizar los datos agregados en la tabla Resena
    await this.prisma.resena.update({
      where: { id: resenaId },
      data: {
        sumaCalificaciones: nuevaSuma,
        totalCalificaciones: nuevoTotal,
        calificacion: promedioRedondeado,
      },
    });
  
    return nuevaCalificacion;
  }
  
  async findAll() {
    return this.prisma.historialCalificaciones.findMany();
  }

  async findOne(id: number) {
    const historial = await this.prisma.historialCalificaciones.findUnique({
      where: { id },
    });

    if (!historial) {
      throw new NotFoundException(`Historial con ID ${id} no encontrado`);
    }

    return historial;
  }

  async update(id: number, updateHistorialCalificacionesDto: UpdateHistorialCalificacionesDto) {
    const historial = await this.prisma.historialCalificaciones.findUnique({
      where: { id },
    });

    if (!historial) {
      throw new NotFoundException(`Historial con ID ${id} no encontrado`);
    }

    return this.prisma.historialCalificaciones.update({
      where: { id },
      data: updateHistorialCalificacionesDto,
    });
  }

  async remove(id: number) {
    const historial = await this.prisma.historialCalificaciones.findUnique({
      where: { id },
    });

    if (!historial) {
      throw new NotFoundException(`Historial con ID ${id} no encontrado`);
    }

    return this.prisma.historialCalificaciones.delete({
      where: { id },
    });
  }
}