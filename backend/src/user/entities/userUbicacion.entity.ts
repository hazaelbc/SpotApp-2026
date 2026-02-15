import { IsInt, IsPositive, IsOptional, IsNumber } from "class-validator";

export class UserUbicacion {
  @IsInt({ message: 'El id debe ser un número entero' })
  @IsPositive({ message: 'El id debe ser positivo' })
  id: number;

  @IsNumber({}, { message: 'La latitud debe ser un número válido' })
  @IsOptional()
  latitud?: number; // Opcional, con valor predeterminado 0.0

  @IsNumber({}, { message: 'La longitud debe ser un número válido' })
  @IsOptional()
  longitud?: number; // Opcional, con valor predeterminado 0.0

  @IsInt({ message: 'El usuarioId debe ser un número entero' })
  @IsPositive({ message: 'El usuarioId debe ser positivo' })
  usuarioId: number;
}