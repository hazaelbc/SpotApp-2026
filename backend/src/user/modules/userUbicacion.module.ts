import { Module } from '@nestjs/common';
import { UserUbicacionService } from '../services/userUbicacion.service';
import { UserUbicacionController } from '../controllers/userUbicacion.controller';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [UserUbicacionController],
  providers: [UserUbicacionService, PrismaService],
})
export class UserUbicacionModule {}