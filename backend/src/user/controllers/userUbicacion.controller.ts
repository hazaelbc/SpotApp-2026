import { Controller, Get, Post, Body, Patch, Param, Delete, Put} from '@nestjs/common';
import { UserUbicacionService } from '../services/userUbicacion.service';
import { CreateUserUbicacionDto } from '../dto/userUbicacionDtos/create-userUbicacion.dto';
import { UpdateUserUbicacionDto } from '../dto/userUbicacionDtos/update-userUbicacion.dto';

@Controller('user-ubicacion')
export class UserUbicacionController {
  constructor(private readonly userUbicacionService: UserUbicacionService) {}

  @Post()
  create(@Body() createUserUbicacionDto: CreateUserUbicacionDto) {
    return this.userUbicacionService.create(createUserUbicacionDto);
  }

  @Get()
  findAll() {
    return this.userUbicacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const numericId = parseInt(id, 10); // Convierte el ID a un número
    if (isNaN(numericId)) {
      throw new Error('El ID proporcionado no es válido.');
    }
    return this.userUbicacionService.findOne(numericId);
  }
  
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userUbicacionService.remove(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string, // Cambia el tipo a string para recibirlo como texto
    @Body() updateUserUbicacionDto: { latitud: number; longitud: number; ubicacionLabel?: string },
  ) {
    const numericId = parseInt(id, 10); // Convierte el ID a un número
    if (isNaN(numericId)) {
      throw new Error('El ID proporcionado no es válido.'); // Maneja el caso de un ID no numérico
    }

    console.log('Datos recibidos en el controlador:', { id: numericId, ...updateUserUbicacionDto });
    return this.userUbicacionService.update(numericId, updateUserUbicacionDto);
  }
}