import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ limit: '10mb', extended: true }));

  // Orígenes permitidos: locales siempre, más cualquier URL extra definida en ALLOWED_ORIGINS
  // En Render/producción, setear ALLOWED_ORIGINS=https://mi-app.vercel.app,https://otro-dominio.com
  const extraOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
    : [];

  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    ...extraOrigins,
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

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();