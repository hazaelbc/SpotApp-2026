import { IsInt, IsPositive, IsString, IsDate, IsNumber } from "class-validator";

export class Resena {
  @IsInt({ message: 'El id debe ser un número entero' })
  @IsPositive({ message: 'El id debe ser positivo' })
  id: number;

  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @IsPositive({ message: 'El ID del usuario debe ser positivo' })
  usuarioId: number;

  @IsString({ message: 'El nombre del lugar debe ser un texto válido' })
  nombreLugar: string;

  @IsNumber({}, { message: 'La calificación promedio debe ser un número' })
  calificacionPromedio: number;

  @IsDate({ message: 'La fecha debe ser una fecha válida' })
  fecha: Date;
}