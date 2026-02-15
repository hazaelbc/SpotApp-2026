import { IsInt, IsPositive, IsString } from 'class-validator';

export class CreateHistorialBusquedaDto {
  @IsInt({ message: 'El ID del usuario debe ser un número entero' })
  @IsPositive({ message: 'El ID del usuario debe ser positivo' })
  usuarioId: number;

  @IsString({ message: 'El término de búsqueda debe ser un texto válido' })
  terminoBusqueda: string;
}