import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import dotenv from 'dotenv';
import { testS3Connection } from '../src/AWS/services/awsService';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true, // Permite todos los orígenes
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  });

  // Middleware para verificar las cabeceras de CORS
  app.use((req, res, next) => {
    console.log('CORS Headers:', res.getHeaders());
    next();
  });

  await app.listen(process.env.PORT ?? 3000);
  testS3Connection();
}
bootstrap();