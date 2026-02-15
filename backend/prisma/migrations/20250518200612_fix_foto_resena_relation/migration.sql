-- CreateTable
CREATE TABLE "fotos_resena" (
    "id" SERIAL NOT NULL,
    "resenaId" INTEGER NOT NULL,
    "url" TEXT NOT NULL DEFAULT 'https://via.placeholder.com/150',
    "orden" INTEGER NOT NULL,

    CONSTRAINT "fotos_resena_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "fotos_resena" ADD CONSTRAINT "fotos_resena_resenaId_fkey" FOREIGN KEY ("resenaId") REFERENCES "resenas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
