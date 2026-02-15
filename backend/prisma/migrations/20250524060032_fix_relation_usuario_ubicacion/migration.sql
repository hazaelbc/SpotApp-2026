/*
  Warnings:

  - You are about to drop the column `usuarioId` on the `ubicaciones_opcionales` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ubicaciones_opcionales" DROP CONSTRAINT "ubicaciones_opcionales_usuarioId_fkey";

-- DropIndex
DROP INDEX "ubicaciones_opcionales_usuarioId_key";

-- AlterTable
ALTER TABLE "ubicaciones_opcionales" DROP COLUMN "usuarioId",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "ubicaciones_opcionales_id_seq";

-- AddForeignKey
ALTER TABLE "ubicaciones_opcionales" ADD CONSTRAINT "ubicaciones_opcionales_id_fkey" FOREIGN KEY ("id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
