import { Module } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserUbicacionModule } from './userUbicacion.module'; // Importa el módulo de UserUbicacion

@Module({
  imports: [UserUbicacionModule],
  controllers: [UserController],
  providers: [UserService, PrismaService],
})
export class UserModule {}