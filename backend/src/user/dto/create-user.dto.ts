import {User} from '../entities/user.entity';
import { OmitType } from '@nestjs/mapped-types';

export class CreateUserDto extends OmitType(User, ['id'] as const) {
    fotoPerfil?: string; // Campo opcional para la URL de la imagen
}