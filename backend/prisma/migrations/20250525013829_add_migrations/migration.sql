-- AlterTable
ALTER TABLE "resenas" ADD COLUMN     "sumaCalificaciones" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalCalificaciones" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "calificaciones" (
    "id" SERIAL NOT NULL,
    "resenaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "calificacion" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calificaciones_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_resenaId_fkey" FOREIGN KEY ("resenaId") REFERENCES "resenas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificaciones" ADD CONSTRAINT "calificaciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
