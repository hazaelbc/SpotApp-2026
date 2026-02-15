import { PartialType } from '@nestjs/mapped-types';
import { CreateUserUbicacionDto } from './create-userUbicacion.dto';

export class UpdateUserUbicacionDto extends PartialType(CreateUserUbicacionDto) {}