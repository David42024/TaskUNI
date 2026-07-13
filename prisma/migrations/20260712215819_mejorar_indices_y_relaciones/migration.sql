/*
  Warnings:

  - A unique constraint covering the columns `[nombre_plan]` on the table `plan` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "consulta_soporte_estado_consulta_idx" ON "consulta_soporte"("estado_consulta");

-- CreateIndex
CREATE INDEX "consulta_soporte_fecha_envio_idx" ON "consulta_soporte"("fecha_envio");

-- CreateIndex
CREATE INDEX "evento_calendario_fecha_inicio_idx" ON "evento_calendario"("fecha_inicio");

-- CreateIndex
CREATE INDEX "evento_calendario_id_usuario_fecha_inicio_idx" ON "evento_calendario"("id_usuario", "fecha_inicio");

-- CreateIndex
CREATE INDEX "integrante_proyecto_id_usuario_idx" ON "integrante_proyecto"("id_usuario");

-- CreateIndex
CREATE INDEX "integrante_proyecto_estado_idx" ON "integrante_proyecto"("estado");

-- CreateIndex
CREATE INDEX "pago_id_suscripcion_idx" ON "pago"("id_suscripcion");

-- CreateIndex
CREATE INDEX "pago_estado_pago_idx" ON "pago"("estado_pago");

-- CreateIndex
CREATE INDEX "pago_fecha_pago_idx" ON "pago"("fecha_pago");

-- CreateIndex
CREATE UNIQUE INDEX "plan_nombre_plan_key" ON "plan"("nombre_plan");

-- CreateIndex
CREATE INDEX "proyecto_id_curso_idx" ON "proyecto"("id_curso");

-- CreateIndex
CREATE INDEX "proyecto_estado_proyecto_idx" ON "proyecto"("estado_proyecto");

-- CreateIndex
CREATE INDEX "recordatorio_id_tarea_idx" ON "recordatorio"("id_tarea");

-- CreateIndex
CREATE INDEX "recordatorio_id_proyecto_idx" ON "recordatorio"("id_proyecto");

-- CreateIndex
CREATE INDEX "recordatorio_fecha_recordatorio_idx" ON "recordatorio"("fecha_recordatorio");

-- CreateIndex
CREATE INDEX "reporte_productividad_fecha_generacion_idx" ON "reporte_productividad"("fecha_generacion");

-- CreateIndex
CREATE INDEX "reporte_productividad_id_usuario_fecha_generacion_idx" ON "reporte_productividad"("id_usuario", "fecha_generacion");

-- CreateIndex
CREATE INDEX "suscripcion_id_plan_idx" ON "suscripcion"("id_plan");

-- CreateIndex
CREATE INDEX "suscripcion_estado_suscripcion_idx" ON "suscripcion"("estado_suscripcion");

-- CreateIndex
CREATE INDEX "suscripcion_id_usuario_estado_suscripcion_idx" ON "suscripcion"("id_usuario", "estado_suscripcion");

-- CreateIndex
CREATE INDEX "tarea_estado_tarea_idx" ON "tarea"("estado_tarea");

-- CreateIndex
CREATE INDEX "tarea_prioridad_idx" ON "tarea"("prioridad");

-- CreateIndex
CREATE INDEX "tarea_fecha_limite_idx" ON "tarea"("fecha_limite");

-- CreateIndex
CREATE INDEX "tarea_id_usuario_estado_tarea_idx" ON "tarea"("id_usuario", "estado_tarea");

-- CreateIndex
CREATE INDEX "tarea_proyecto_id_usuario_asignado_idx" ON "tarea_proyecto"("id_usuario_asignado");
