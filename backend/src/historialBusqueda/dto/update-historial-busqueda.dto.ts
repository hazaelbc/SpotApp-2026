
import { PartialType } from '@nestjs/mapped-types';
import { CreateHistorialBusquedaDto } from './create-historial-busqueda.dto';

export class UpdateHistorialBusquedaDto extends PartialType(CreateHistorialBusquedaDto) {}