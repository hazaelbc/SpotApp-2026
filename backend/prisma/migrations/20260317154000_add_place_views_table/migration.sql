-- CreateTable
CREATE TABLE "place_views" (
  "id" SERIAL NOT NULL,
  "placeId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "place_views_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "place_views_placeId_createdAt_idx" ON "place_views"("placeId", "createdAt");

-- AddForeignKey
ALTER TABLE "place_views"
ADD CONSTRAINT "place_views_placeId_fkey"
FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
