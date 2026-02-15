import { Module } from '@nestjs/common';
import { ComentarioResenaService } from '../service/comentario-resena.service';
import { ComentarioResenaController } from '../controller/comentario-resena.controller';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [ComentarioResenaController],
  providers: [ComentarioResenaService, PrismaService],
})
export class ComentarioResenaModule {}