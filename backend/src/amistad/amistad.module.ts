import { Module } from '@nestjs/common';
import { AmistadController } from './amistad.controller';
import { AmistadService } from './amistad.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [AmistadController],
  providers: [AmistadService, PrismaService],
})
export class AmistadModule {}
