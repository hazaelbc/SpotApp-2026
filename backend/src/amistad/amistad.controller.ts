import { Controller, Post, Delete, Patch, Get, Body, Param, ParseIntPipe } from '@nestjs/common';
import { AmistadService } from './amistad.service';

@Controller('amistad')
export class AmistadController {
  constructor(private readonly amistadService: AmistadService) {}

  @Post('solicitud')
  enviar(@Body() body: { fromId: number; toId: number }) {
    return this.amistadService.enviarSolicitud(Number(body.fromId), Number(body.toId));
  }

  @Delete('solicitud')
  cancelar(@Body() body: { fromId: number; toId: number }) {
    return this.amistadService.cancelarSolicitud(Number(body.fromId), Number(body.toId));
  }

  @Patch('solicitud/:id/aceptar')
  aceptar(@Param('id', ParseIntPipe) id: number, @Body() body: { userId: number }) {
    return this.amistadService.aceptarSolicitud(id, Number(body.userId));
  }

  @Patch('solicitud/:id/rechazar')
  rechazar(@Param('id', ParseIntPipe) id: number, @Body() body: { userId: number }) {
    return this.amistadService.rechazarSolicitud(id, Number(body.userId));
  }

  @Get('recibidas/:userId')
  recibidas(@Param('userId', ParseIntPipe) userId: number) {
    return this.amistadService.getSolicitudesRecibidas(userId);
  }

  @Get('enviadas/:userId')
  enviadas(@Param('userId', ParseIntPipe) userId: number) {
    return this.amistadService.getEstadosEnviados(userId);
  }

  @Get('amigos/:userId')
  amigos(@Param('userId', ParseIntPipe) userId: number) {
    return this.amistadService.getAmigos(userId);
  }

  @Delete('amigos')
  eliminarAmistad(@Body() body: { userAId: number; userBId: number }) {
    return this.amistadService.eliminarAmistad(Number(body.userAId), Number(body.userBId));
  }
}
