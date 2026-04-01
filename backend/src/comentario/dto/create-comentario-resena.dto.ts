import { IsInt, IsPositive, IsString, IsOptional, IsNumber, Min, Max } from "class-validator";

export class CreateComentarioResenaDto {
  @IsInt({ message: 'El ID de la reseña debe ser un número entero' })
  @IsPositive({ message: 'El ID de la reseña debe ser positivo' })
  resenaId: number;

  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @IsPositive({ message: 'El ID del usuario debe ser positivo' })
  usuarioId: number;

  @IsString({ message: 'El comentario debe ser un texto válido' })
  comentario: string;

  @IsOptional()
  @IsNumber({}, { message: 'La calificación debe ser numérica' })
  @Min(0, { message: 'La calificación no puede ser menor a 0' })
  @Max(5, { message: 'La calificación no puede ser mayor a 5' })
  rating?: number;

  @IsOptional()
  fecha?: Date;
}