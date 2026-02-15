import { IsInt, IsPositive, IsOptional } from 'class-validator';

export class CreateHistorialCalificacionesDto {
  @IsInt({ message: 'El ID de la reseña debe ser un número entero' })
  @IsPositive({ message: 'El ID de la reseña debe ser positivo' })
  resenaId: number;

  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @IsPositive({ message: 'El ID del usuario debe ser positivo' })
  usuarioId: number;

  @IsInt({ message: 'La calificación debe ser un número entero' })
  @IsPositive({ message: 'La calificación debe ser positiva' })
  calificacion: number;

  @IsOptional()
  fecha?: Date;
}