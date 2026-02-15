
import { IsInt, IsPositive, IsString, IsEmail, MinLength, IsOptional, IsBoolean } from "class-validator";

export class User {
  @IsInt({ message: 'El id debe ser un número entero' })
  @IsPositive({ message: 'El id debe ser positivo' })
  id: number;

  @IsString({ message: 'El nombre debe ser un texto válido' })
  nombre: string;

  @IsEmail({}, { message: 'El email debe ser una dirección válida' })
  email: string;

  @IsOptional()
  @IsString({ message: 'La contraseña debe ser un texto válido' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  contrasena?: string | null;

  @IsOptional()
  @IsString({ message: 'El googleId debe ser un texto válido' })
  googleId?: string | null;

  @IsOptional()
  @IsString({ message: 'El provider debe ser un texto válido' })
  provider?: string;

  @IsOptional()
  @IsBoolean({ message: 'emailVerificado debe ser un booleano' })
  emailVerificado?: boolean;

  @IsOptional()
  @IsString({ message: 'La foto de perfil debe ser una URL válida' })
  fotoPerfil?: string;
}

