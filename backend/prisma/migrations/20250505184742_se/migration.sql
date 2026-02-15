-- CreateTable
CREATE TABLE "ubicaciones_opcionales" (
    "id" SERIAL NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "longitud" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "usuarioId" INTEGER NOT NULL,

    CONSTRAINT "ubicaciones_opcionales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ubicaciones_opcionales_usuarioId_key" ON "ubicaciones_opcionales"("usuarioId");

-- AddForeignKey
ALTER TABLE "ubicaciones_opcionales" ADD CONSTRAINT "ubicaciones_opcionales_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
