-- CreateTable
CREATE TABLE "archivo" (
    "id_archivo" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "id_curso" TEXT,
    "id_proyecto" TEXT,
    "nombre_original" TEXT NOT NULL,
    "nombre_archivo" TEXT NOT NULL,
    "tipo_mime" TEXT NOT NULL,
    "tamano_bytes" INTEGER NOT NULL,
    "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "archivo_pkey" PRIMARY KEY ("id_archivo")
);

-- CreateIndex
CREATE INDEX "archivo_id_usuario_idx" ON "archivo"("id_usuario");

-- CreateIndex
CREATE INDEX "archivo_id_curso_idx" ON "archivo"("id_curso");

-- CreateIndex
CREATE INDEX "archivo_id_proyecto_idx" ON "archivo"("id_proyecto");

-- AddForeignKey
ALTER TABLE "archivo" ADD CONSTRAINT "archivo_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivo" ADD CONSTRAINT "archivo_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivo" ADD CONSTRAINT "archivo_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id_proyecto") ON DELETE SET NULL ON UPDATE CASCADE;
