-- CreateTable
CREATE TABLE "comentarios_resena" (
    "id" SERIAL NOT NULL,
    "resenaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "comentario" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comentarios_resena_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_calificaciones" (
    "id" SERIAL NOT NULL,
    "resenaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "calificacion" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_calificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_busqueda" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "terminoBusqueda" TEXT NOT NULL,

    CONSTRAINT "historial_busqueda_pkey" PRIMARY KEY ("id")
);
