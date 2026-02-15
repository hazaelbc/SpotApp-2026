import { Module } from '@nestjs/common';
import { ResenaService } from '../services/resena.service';
import { ResenaController } from '../controllers/resena.controller';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [ResenaController],
  providers: [ResenaService, PrismaService],
})
export class ResenaModule {}