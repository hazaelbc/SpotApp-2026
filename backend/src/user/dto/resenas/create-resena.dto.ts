import { IsInt, IsString, IsNumber, IsOptional, IsNotEmpty,} from 'class-validator';

export class CreateResenaDto {
  @IsInt()
  usuarioId: number;

  @IsNumber()
  @IsOptional()
  latitud?: number;

  @IsNumber()
  @IsOptional()
  longitud?: number;

  @IsString()
  nombreLugar: string;

  @IsInt()
  categoriaId: number;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  fotoPrincipal?: string | null;
}