-- AlterTable
ALTER TABLE "recordatorio" ADD COLUMN     "id_evento" TEXT;

-- CreateIndex
CREATE INDEX "recordatorio_id_evento_idx" ON "recordatorio"("id_evento");

-- AddForeignKey
ALTER TABLE "recordatorio" ADD CONSTRAINT "recordatorio_id_evento_fkey" FOREIGN KEY ("id_evento") REFERENCES "evento_calendario"("id_evento") ON DELETE CASCADE ON UPDATE CASCADE;
