import { Controller, Get, Post, Body, Put, Param, Delete, UseInterceptors, UploadedFile} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService} from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity'; // Ajusta la ruta según corresponda
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';



@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseInterceptors(FileInterceptor('imagen'))
  async create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    console.log('Datos recibidos en el controlador (body):', body);
    console.log('Archivo recibido (file):', file);

    const createUserDto = plainToInstance(CreateUserDto, body);

    const errors = await validate(createUserDto);
    if (errors.length > 0) {
      console.error('Errores de validación:', errors);
      throw new BadRequestException('Datos inválidos');
    }

    return this.userService.create(createUserDto, file);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const { email, password } = body;
    const user = await this.userService.validateUser(email, password);
  
    if (!user) {
      throw new BadRequestException('Credenciales incorrectas');
    }
  
    return {
      message: 'Inicio de sesión exitoso',
      token: 'jwt-token-aqui', // Si usas JWT
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        fotoPerfil: user.fotoPerfil, // Incluye la foto de perfil
      },
    };
  }

  @Get('basic')
  findBasic() {
    return this.userService.findBasic();
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id); // convierte a número
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}