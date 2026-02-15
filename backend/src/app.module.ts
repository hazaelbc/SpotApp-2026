// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';

// @Module({
//   imports: [],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/modules/user.modules';
import { ResenaModule } from './user/modules/resena.module';
import { ComentarioResenaModule } from './comentario/module/comentario-resena.module';
import { HistorialCalificacionesModule } from './historialCalificaciones/module/historial-calificaciones.module';
import { HistorialBusquedaModule } from './historialBusqueda/module/historial-busqueda.module';

@Module({
  imports: [UserModule, 
    ResenaModule, 
    ComentarioResenaModule, 
    HistorialCalificacionesModule,
    HistorialBusquedaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}