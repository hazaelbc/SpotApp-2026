-- CreateTable
CREATE TABLE "favorites" (
  "id" SERIAL NOT NULL,
  "usuarioId" INTEGER NOT NULL,
  "placeId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favorites_usuarioId_placeId_key" ON "favorites"("usuarioId", "placeId");

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
