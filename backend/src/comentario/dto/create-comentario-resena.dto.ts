import { IsInt, IsPositive, IsString, IsOptional } from "class-validator";

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
  fecha?: Date;
}