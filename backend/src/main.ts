import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { testS3Connection } from '../src/AWS/services/awsService';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser tools (curl, server-to-server) which have no origin
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Añadir cabecera COOP en desarrollo para permitir popups cerrados por Firebase
  app.use((req, res, next) => {
    if (process.env.NODE_ENV !== 'production') {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    }
    next();
  });

  // Middleware para verificar las cabeceras de respuesta (útil para debug CORS)
  app.use((req, res, next) => {
    console.log('Response Headers Preview:', res.getHeaders());
    next();
  });

  await app.listen(process.env.PORT ?? 3001);
  testS3Connection();
}

bootstrap();