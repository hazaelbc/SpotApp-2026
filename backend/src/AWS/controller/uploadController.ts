import { Request, Response } from 'express';
import { getPresignedUrl } from '../services/awsService';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

export const generatePresignedUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename, contentType } = req.query;

    if (!filename || !contentType) {
      res.status(400).json({ error: 'Faltan parámetros: filename o contentType' });
      return;
    }

    const url = await getPresignedUrl(filename as string, contentType as string);
    res.json({ url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar la URL prefirmada' });
  }
};

export const saveImage = async (req: Request, res: Response): Promise<void> => {
  const { resenaId, url, orden } = req.body;

  if (!resenaId || !url || !orden) {
    res.status(400).json({ error: 'Faltan parámetros: resenaId, url o orden' });
    return;
  }

  try {
    await db.fotoResena.create({
      data: { resenaId, url, orden },
    });
    res.status(200).json({ message: 'Imagen guardada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al guardar la imagen en la base de datos' });
  }
};