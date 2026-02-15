-- CreateTable
CREATE TABLE "resenas" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "longitud" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "nombreLugar" TEXT NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resenas_pkey" PRIMARY KEY ("id")
);
