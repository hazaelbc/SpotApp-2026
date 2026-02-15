-- AddForeignKey
ALTER TABLE "comentarios_resena" ADD CONSTRAINT "comentarios_resena_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comentarios_resena" ADD CONSTRAINT "comentarios_resena_resenaId_fkey" FOREIGN KEY ("resenaId") REFERENCES "resenas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
