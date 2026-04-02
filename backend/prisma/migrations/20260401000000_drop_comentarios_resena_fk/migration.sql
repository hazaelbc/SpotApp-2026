-- Drop FK constraint so resenaId can store placeId directly
ALTER TABLE "comentarios_resena" DROP CONSTRAINT IF EXISTS "comentarios_resena_resenaId_fkey";
