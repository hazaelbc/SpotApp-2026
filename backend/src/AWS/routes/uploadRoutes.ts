import { Router } from 'express';
import { generatePresignedUrl, saveImage } from '../controller/uploadController';

const router = Router();

// Ruta para generar una URL prefirmada
router.get('/generate-presigned-url', generatePresignedUrl);

// Ruta para guardar la URL de la imagen en la base de datos
router.post('/save-image', saveImage);

export default router;