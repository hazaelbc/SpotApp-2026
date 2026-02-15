import { Controller, Get, Post, Body, Param, Patch,UseInterceptors, Delete,UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResenaService } from '../services/resena.service';
import { CreateResenaDto } from '../dto/resenas/create-resena.dto';
import { UpdateResenaDto } from '../dto/resenas/update-resena.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

@Controller('resenas')
export class ResenaController {
  constructor(private readonly resenaService: ResenaService) {}

  @Post()
  @UseInterceptors(FileInterceptor('fotoPrincipal')) // Manejar la imagen
  async create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    console.log('Datos recibidos en el controlador (body):', body);
    console.log('Archivo recibido (file):', file);

    // Convertir los valores que deben ser números
    body.usuarioId = parseInt(body.usuarioId, 10);
    body.latitud = parseFloat(body.latitud);
    body.longitud = parseFloat(body.longitud);
    body.categoriaId = parseInt(body.categoriaId, 10);

    // Validar los datos del cuerpo
    const createResenaDto = plainToInstance(CreateResenaDto, body);
    const errors = await validate(createResenaDto);
    if (errors.length > 0) {
      console.error('Errores de validación:', errors);
      throw new BadRequestException('Datos inválidos');
    }

    // Enviar los datos al servicio
    return this.resenaService.create(createResenaDto, file);
  }

  @Get()
  findAll() {
    return this.resenaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resenaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateResenaDto: UpdateResenaDto) {
    return this.resenaService.update(+id, updateResenaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resenaService.remove(+id);
  }
}