-- AlterTable: Modificar tabla usuarios para soportar Google OAuth
ALTER TABLE "usuarios" 
  -- Hacer contrasena opcional (NULL para usuarios de Google)
  ALTER COLUMN "contrasena" DROP NOT NULL,
  
  -- Agregar campos para Google OAuth
  ADD COLUMN "googleId" TEXT,
  ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'local',
  ADD COLUMN "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
  
  -- Agregar timestamps
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex: Agregar índice único para googleId
CREATE UNIQUE INDEX "usuarios_googleId_key" ON "usuarios"("googleId");
