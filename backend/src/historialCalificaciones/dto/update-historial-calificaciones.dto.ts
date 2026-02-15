import { PartialType } from '@nestjs/mapped-types';
import { CreateHistorialCalificacionesDto } from './create-historial-calificaciones.dto';

export class UpdateHistorialCalificacionesDto extends PartialType(CreateHistorialCalificacionesDto) {}