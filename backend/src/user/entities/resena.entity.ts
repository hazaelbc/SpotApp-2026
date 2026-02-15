import { IsInt, IsPositive, IsString, IsNumber, IsOptional,MaxLength  } from "class-validator";

export class Resena {
  @IsInt({ message: 'El id debe ser un número entero' })
  @IsPositive({ message: 'El id debe ser positivo' })
  id: number;

  @IsInt({ message: 'El usuarioId debe ser un número entero' })
  @IsPositive({ message: 'El usuarioId debe ser positivo' })
  usuarioId: number;

  @IsNumber({}, { message: 'La latitud debe ser un número válido' })
  @IsOptional()
  latitud?: number;

  @IsNumber({}, { message: 'La longitud debe ser un número válido' })
  @IsOptional()
  longitud?: number;

  @IsString({ message: 'El nombre del lugar debe ser un texto válido' })
  nombreLugar: string;

  @IsString()
  @MaxLength(500, { message: 'La descripción no puede tener más de 500 caracteres' })
  descripcion: string;

  @IsInt({ message: 'El categoriaId debe ser un número entero' })
  @IsPositive({ message: 'El categoriaId debe ser positivo' })
  categoriaId: number;

  @IsOptional()
  fecha?: Date;
}
