-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('estudiante', 'administrador');

-- CreateEnum
CREATE TYPE "EstadoUsuario" AS ENUM ('activo', 'inactivo', 'suspendido');

-- CreateEnum
CREATE TYPE "TipoPlan" AS ENUM ('gratuito', 'premium');

-- CreateEnum
CREATE TYPE "EstadoSuscripcion" AS ENUM ('activa', 'vencida', 'cancelada');

-- CreateEnum
CREATE TYPE "PrioridadTarea" AS ENUM ('baja', 'media', 'alta');

-- CreateEnum
CREATE TYPE "EstadoTarea" AS ENUM ('pendiente', 'en_progreso', 'completada', 'vencida');

-- CreateEnum
CREATE TYPE "EstadoProyecto" AS ENUM ('planificacion', 'en_progreso', 'completado', 'atrasado');

-- CreateEnum
CREATE TYPE "EstadoIntegrante" AS ENUM ('activo', 'invitado', 'removido');

-- CreateEnum
CREATE TYPE "TipoRecordatorio" AS ENUM ('basico', 'inteligente');

-- CreateEnum
CREATE TYPE "EstadoRecordatorio" AS ENUM ('pendiente', 'enviado', 'descartado');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('entrega', 'reunion', 'examen', 'otro');

-- CreateEnum
CREATE TYPE "EstadoConsulta" AS ENUM ('pendiente', 'respondida', 'cerrada');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('aprobado', 'rechazado', 'pendiente');

-- CreateTable
CREATE TABLE "usuario" (
    "id_usuario" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "correo" VARCHAR(150) NOT NULL,
    "correo_norm" TEXT NOT NULL,
    "contrasena_hash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'estudiante',
    "estado" "EstadoUsuario" NOT NULL DEFAULT 'activo',
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimo_acceso" TIMESTAMP(3),

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "perfil_estudiante" (
    "id_perfil" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "universidad" TEXT NOT NULL,
    "carrera" TEXT NOT NULL,
    "ciclo_academico" TEXT NOT NULL,
    "codigo_estudiante" TEXT,

    CONSTRAINT "perfil_estudiante_pkey" PRIMARY KEY ("id_perfil")
);

-- CreateTable
CREATE TABLE "plan" (
    "id_plan" TEXT NOT NULL,
    "nombre_plan" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio_mensual" DECIMAL(10,2) NOT NULL,
    "tipo_plan" "TipoPlan" NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'activo',

    CONSTRAINT "plan_pkey" PRIMARY KEY ("id_plan")
);

-- CreateTable
CREATE TABLE "suscripcion" (
    "id_suscripcion" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "id_plan" TEXT NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" TIMESTAMP(3),
    "estado_suscripcion" "EstadoSuscripcion" NOT NULL DEFAULT 'activa',

    CONSTRAINT "suscripcion_pkey" PRIMARY KEY ("id_suscripcion")
);

-- CreateTable
CREATE TABLE "curso" (
    "id_curso" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "nombre_curso" TEXT NOT NULL,
    "docente" TEXT,
    "ciclo" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'activo',

    CONSTRAINT "curso_pkey" PRIMARY KEY ("id_curso")
);

-- CreateTable
CREATE TABLE "tarea" (
    "id_tarea" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "id_curso" TEXT,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_limite" TIMESTAMP(3),
    "prioridad" "PrioridadTarea" NOT NULL DEFAULT 'media',
    "estado_tarea" "EstadoTarea" NOT NULL DEFAULT 'pendiente',
    "avance_porcentual" INTEGER NOT NULL DEFAULT 0,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarea_pkey" PRIMARY KEY ("id_tarea")
);

-- CreateTable
CREATE TABLE "proyecto" (
    "id_proyecto" TEXT NOT NULL,
    "id_usuario_creador" TEXT NOT NULL,
    "id_curso" TEXT,
    "nombre_proyecto" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_entrega" TIMESTAMP(3),
    "estado_proyecto" "EstadoProyecto" NOT NULL DEFAULT 'planificacion',
    "avance_general" INTEGER NOT NULL DEFAULT 0,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proyecto_pkey" PRIMARY KEY ("id_proyecto")
);

-- CreateTable
CREATE TABLE "integrante_proyecto" (
    "id_integrante" TEXT NOT NULL,
    "id_proyecto" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "rol_en_proyecto" TEXT NOT NULL DEFAULT 'colaborador',
    "responsabilidad" TEXT,
    "estado" "EstadoIntegrante" NOT NULL DEFAULT 'invitado',

    CONSTRAINT "integrante_proyecto_pkey" PRIMARY KEY ("id_integrante")
);

-- CreateTable
CREATE TABLE "tarea_proyecto" (
    "id_tarea_proyecto" TEXT NOT NULL,
    "id_proyecto" TEXT NOT NULL,
    "id_usuario_asignado" TEXT,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoTarea" NOT NULL DEFAULT 'pendiente',
    "prioridad" "PrioridadTarea" NOT NULL DEFAULT 'media',
    "fecha_limite" TIMESTAMP(3),
    "avance_porcentual" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tarea_proyecto_pkey" PRIMARY KEY ("id_tarea_proyecto")
);

-- CreateTable
CREATE TABLE "recordatorio" (
    "id_recordatorio" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "id_tarea" TEXT,
    "id_proyecto" TEXT,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "fecha_recordatorio" TIMESTAMP(3) NOT NULL,
    "tipo_recordatorio" "TipoRecordatorio" NOT NULL DEFAULT 'basico',
    "estado" "EstadoRecordatorio" NOT NULL DEFAULT 'pendiente',

    CONSTRAINT "recordatorio_pkey" PRIMARY KEY ("id_recordatorio")
);

-- CreateTable
CREATE TABLE "evento_calendario" (
    "id_evento" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo_evento" "TipoEvento" NOT NULL DEFAULT 'otro',
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3),
    "ubicacion" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'programado',

    CONSTRAINT "evento_calendario_pkey" PRIMARY KEY ("id_evento")
);

-- CreateTable
CREATE TABLE "consulta_soporte" (
    "id_consulta" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "asunto" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "estado_consulta" "EstadoConsulta" NOT NULL DEFAULT 'pendiente',
    "fecha_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_respuesta" TIMESTAMP(3),
    "respuesta" TEXT,

    CONSTRAINT "consulta_soporte_pkey" PRIMARY KEY ("id_consulta")
);

-- CreateTable
CREATE TABLE "reporte_productividad" (
    "id_reporte" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "periodo" TEXT NOT NULL,
    "total_tareas" INTEGER NOT NULL DEFAULT 0,
    "tareas_completadas" INTEGER NOT NULL DEFAULT 0,
    "tareas_pendientes" INTEGER NOT NULL DEFAULT 0,
    "tareas_vencidas" INTEGER NOT NULL DEFAULT 0,
    "porcentaje_cumplimiento" INTEGER NOT NULL DEFAULT 0,
    "racha_productividad" INTEGER NOT NULL DEFAULT 0,
    "fecha_generacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reporte_productividad_pkey" PRIMARY KEY ("id_reporte")
);

-- CreateTable
CREATE TABLE "pago" (
    "id_pago" TEXT NOT NULL,
    "id_usuario" TEXT NOT NULL,
    "id_suscripcion" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "metodo_pago" TEXT NOT NULL,
    "estado_pago" "EstadoPago" NOT NULL DEFAULT 'pendiente',
    "fecha_pago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pago_pkey" PRIMARY KEY ("id_pago")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_norm_key" ON "usuario"("correo_norm");

-- CreateIndex
CREATE UNIQUE INDEX "perfil_estudiante_id_usuario_key" ON "perfil_estudiante"("id_usuario");

-- CreateIndex
CREATE INDEX "suscripcion_id_usuario_idx" ON "suscripcion"("id_usuario");

-- CreateIndex
CREATE INDEX "curso_id_usuario_idx" ON "curso"("id_usuario");

-- CreateIndex
CREATE INDEX "tarea_id_usuario_idx" ON "tarea"("id_usuario");

-- CreateIndex
CREATE INDEX "tarea_id_curso_idx" ON "tarea"("id_curso");

-- CreateIndex
CREATE INDEX "proyecto_id_usuario_creador_idx" ON "proyecto"("id_usuario_creador");

-- CreateIndex
CREATE UNIQUE INDEX "integrante_proyecto_id_proyecto_id_usuario_key" ON "integrante_proyecto"("id_proyecto", "id_usuario");

-- CreateIndex
CREATE INDEX "tarea_proyecto_id_proyecto_idx" ON "tarea_proyecto"("id_proyecto");

-- CreateIndex
CREATE INDEX "recordatorio_id_usuario_idx" ON "recordatorio"("id_usuario");

-- CreateIndex
CREATE INDEX "evento_calendario_id_usuario_idx" ON "evento_calendario"("id_usuario");

-- CreateIndex
CREATE INDEX "consulta_soporte_id_usuario_idx" ON "consulta_soporte"("id_usuario");

-- CreateIndex
CREATE INDEX "reporte_productividad_id_usuario_idx" ON "reporte_productividad"("id_usuario");

-- CreateIndex
CREATE INDEX "pago_id_usuario_idx" ON "pago"("id_usuario");

-- AddForeignKey
ALTER TABLE "perfil_estudiante" ADD CONSTRAINT "perfil_estudiante_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suscripcion" ADD CONSTRAINT "suscripcion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suscripcion" ADD CONSTRAINT "suscripcion_id_plan_fkey" FOREIGN KEY ("id_plan") REFERENCES "plan"("id_plan") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curso" ADD CONSTRAINT "curso_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarea" ADD CONSTRAINT "tarea_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarea" ADD CONSTRAINT "tarea_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyecto" ADD CONSTRAINT "proyecto_id_usuario_creador_fkey" FOREIGN KEY ("id_usuario_creador") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proyecto" ADD CONSTRAINT "proyecto_id_curso_fkey" FOREIGN KEY ("id_curso") REFERENCES "curso"("id_curso") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrante_proyecto" ADD CONSTRAINT "integrante_proyecto_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id_proyecto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrante_proyecto" ADD CONSTRAINT "integrante_proyecto_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarea_proyecto" ADD CONSTRAINT "tarea_proyecto_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id_proyecto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarea_proyecto" ADD CONSTRAINT "tarea_proyecto_id_usuario_asignado_fkey" FOREIGN KEY ("id_usuario_asignado") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recordatorio" ADD CONSTRAINT "recordatorio_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recordatorio" ADD CONSTRAINT "recordatorio_id_tarea_fkey" FOREIGN KEY ("id_tarea") REFERENCES "tarea"("id_tarea") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recordatorio" ADD CONSTRAINT "recordatorio_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id_proyecto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evento_calendario" ADD CONSTRAINT "evento_calendario_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consulta_soporte" ADD CONSTRAINT "consulta_soporte_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reporte_productividad" ADD CONSTRAINT "reporte_productividad_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_id_suscripcion_fkey" FOREIGN KEY ("id_suscripcion") REFERENCES "suscripcion"("id_suscripcion") ON DELETE CASCADE ON UPDATE CASCADE;
