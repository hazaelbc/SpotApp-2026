import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { HistorialBusquedaService } from '../service/historial-busqueda.service';
import { CreateHistorialBusquedaDto } from '../dto/create-historial-busqueda.dto';
import { UpdateHistorialBusquedaDto } from '../dto/update-historial-busqueda.dto';

@Controller('historial-busqueda')
export class HistorialBusquedaController {
  constructor(private readonly historialBusquedaService: HistorialBusquedaService) {}

  @Post()
  create(@Body() createHistorialBusquedaDto: CreateHistorialBusquedaDto) {
    return this.historialBusquedaService.create(createHistorialBusquedaDto);
  }

  @Get()
  findAll() {
    return this.historialBusquedaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historialBusquedaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHistorialBusquedaDto: UpdateHistorialBusquedaDto) {
    return this.historialBusquedaService.update(+id, updateHistorialBusquedaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historialBusquedaService.remove(+id);
  }
}