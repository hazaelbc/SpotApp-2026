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

  @Post('register')
  async register(@Body() body: { 
    nombre: string; 
    email: string; 
    contrasena: string;
    googleId?: string;
    provider?: string;
    fotoPerfil?: string;
  }) {
    const { nombre, email, contrasena, googleId, provider, fotoPerfil } = body;

    console.log('Register endpoint - provider:', provider, '| email:', email);

    // Validar que los campos requeridos estén presentes
    if (!nombre || !email || !contrasena) {
      throw new BadRequestException('Nombre, email y contraseña son requeridos');
    }

    // Para usuarios de Google: si ya existe, hacer login directo
    if (provider === 'google') {
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        console.log('Google user found, returning existing data for:', email);
        return {
          message: 'Inicio de sesión exitoso',
          user: {
            id: existingUser.id,
            nombre: existingUser.nombre,
            email: existingUser.email,
            fotoPerfil: existingUser.fotoPerfil,
          },
        };
      }
    }

    // Para registro normal: verificar si el email ya existe
    const emailExists = await this.userService.findByEmail(email);
    if (emailExists) {
      throw new BadRequestException(`El email ${email} ya existe`);
    }

    // Crear el DTO para el usuario
    const createUserDto: CreateUserDto = {
      nombre,
      email,
      contrasena,
      googleId: googleId || null,
      provider: provider || 'local',
      emailVerificado: provider === 'google',
      fotoPerfil,
    };

    // Crear el usuario en la base de datos
    const user = await this.userService.create(createUserDto);

    return {
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        fotoPerfil: user.fotoPerfil,
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