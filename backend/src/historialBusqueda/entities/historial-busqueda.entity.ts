import { IsInt, IsPositive, IsString } from 'class-validator';

export class HistorialBusqueda {
  @IsInt({ message: 'El id debe ser un número entero' })
  @IsPositive({ message: 'El id debe ser positivo' })
  id: number;

  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @IsPositive({ message: 'El ID del usuario debe ser positivo' })
  usuarioId: number;

  @IsString({ message: 'El término de búsqueda debe ser un texto válido' })
  terminoBusqueda: string;
}