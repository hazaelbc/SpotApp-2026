import { IsNumber, IsOptional, IsInt, IsPositive } from 'class-validator';

export class CreateUserUbicacionDto {
  @IsNumber({}, { message: 'La latitud debe ser un número válido' })
  @IsOptional()
  latitud?: number;

  @IsNumber({}, { message: 'La longitud debe ser un número válido' })
  @IsOptional()
  longitud?: number;

  @IsInt({ message: 'El usuarioId debe ser un número entero' })
  @IsPositive({ message: 'El usuarioId debe ser positivo' })
  usuarioId: number;
}