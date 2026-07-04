import { z } from "zod";

export const registroSchema = z.object({
  nombres: z.string().min(2, "Los nombres son obligatorios"),
  apellidos: z.string().min(2, "Los apellidos son obligatorios"),
  correo: z.string().email("Correo electrónico inválido"),
  contrasena: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  universidad: z.string().min(2, "La universidad es obligatoria"),
  carrera: z.string().min(2, "La carrera es obligatoria"),
  ciclo_academico: z.string().min(1, "El ciclo académico es obligatorio"),
});

export const loginSchema = z.object({
  correo: z.string().email("Correo electrónico inválido"),
  contrasena: z.string().min(1, "La contraseña es obligatoria"),
});

export const tareaSchema = z.object({
  titulo: z.string().min(2, "El título es obligatorio"),
  descripcion: z.string().optional().nullable(),
  id_curso: z.string().optional().nullable(),
  fecha_limite: z.string().optional().nullable(),
  prioridad: z.enum(["baja", "media", "alta"]).default("media"),
  estado_tarea: z.enum(["pendiente", "en_progreso", "completada", "vencida"]).default("pendiente"),
  avance_porcentual: z.coerce.number().min(0).max(100).default(0),
});

export const proyectoSchema = z.object({
  nombre_proyecto: z.string().min(2, "El nombre del proyecto es obligatorio"),
  descripcion: z.string().optional().nullable(),
  fecha_entrega: z.string().optional().nullable(),
  estado_proyecto: z.enum(["planificacion", "en_progreso", "completado", "atrasado"]).default("planificacion"),
  avance_general: z.coerce.number().min(0).max(100).default(0),
});

export const eventoSchema = z.object({
  titulo: z.string().min(2, "El título es obligatorio"),
  descripcion: z.string().optional().nullable(),
  tipo_evento: z.enum(["entrega", "reunion", "examen", "otro"]).default("otro"),
  fecha_inicio: z.string().min(1, "La fecha de inicio es obligatoria"),
  fecha_fin: z.string().optional().nullable(),
  ubicacion: z.string().optional().nullable(),
});

export const soporteSchema = z.object({
  asunto: z.string().min(2, "El asunto es obligatorio"),
  mensaje: z.string().min(5, "El mensaje es obligatorio"),
});
