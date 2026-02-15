import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { ComentarioResenaService } from '../service/comentario-resena.service';
import { CreateComentarioResenaDto } from '../dto/create-comentario-resena.dto';
import { UpdateComentarioResenaDto } from '../dto/update-comentario-resena.dto';

@Controller('comentarios-resena')
export class ComentarioResenaController {
  constructor(private readonly comentarioResenaService: ComentarioResenaService) {}

  @Post()
  create(@Body() createComentarioResenaDto: CreateComentarioResenaDto) {
    return this.comentarioResenaService.create(createComentarioResenaDto);
  }

  @Get()
  findAll() {
    return this.comentarioResenaService.findAll();
  }

  @Get('resena/:resenaId')
  findByResenaId(@Param('resenaId') resenaId: number) {
  return this.comentarioResenaService.findByResenaId(resenaId);
}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comentarioResenaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateComentarioResenaDto: UpdateComentarioResenaDto) {
    return this.comentarioResenaService.update(+id, updateComentarioResenaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.comentarioResenaService.remove(+id);
  }
}