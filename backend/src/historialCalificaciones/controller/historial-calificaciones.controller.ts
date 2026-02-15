import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { HistorialCalificacionesService } from '../service/historial-calificaciones.service';
import { CreateHistorialCalificacionesDto } from '../dto/create-historial-calificaciones.dto';
import { UpdateHistorialCalificacionesDto } from '../dto/update-historial-calificaciones.dto';

@Controller('historial-calificaciones')
export class HistorialCalificacionesController {
  constructor(private readonly historialCalificacionesService: HistorialCalificacionesService) {}

  @Post()
  create(@Body() createHistorialCalificacionesDto: CreateHistorialCalificacionesDto) {
    return this.historialCalificacionesService.create(createHistorialCalificacionesDto);
  }

  @Get()
  findAll() {
    return this.historialCalificacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historialCalificacionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHistorialCalificacionesDto: UpdateHistorialCalificacionesDto) {
    return this.historialCalificacionesService.update(+id, updateHistorialCalificacionesDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historialCalificacionesService.remove(+id);
  }
}