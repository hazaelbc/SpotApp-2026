/*
  Warnings:

  - You are about to drop the column `fecha` on the `calificaciones` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "calificaciones" DROP COLUMN "fecha",
ADD COLUMN     "direccion" TEXT;
