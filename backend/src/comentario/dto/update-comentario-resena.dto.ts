import { PartialType } from '@nestjs/mapped-types';
import { CreateComentarioResenaDto } from './create-comentario-resena.dto';

export class UpdateComentarioResenaDto extends PartialType(CreateComentarioResenaDto) {}