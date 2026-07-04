import { prisma } from "@/lib/prisma";
import type { NotificationItem } from "@/lib/notifications";

export function getPeriodLabel(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMoney(value: number | string | bigint | null | undefined) {
  return `S/ ${Number(value ?? 0).toFixed(2)}`;
}

export function percentFrom(total: number, base: number) {
  if (!base) return 0;
  return Math.round((total / base) * 100);
}

function relativeLabel(date: Date) {
  const diffDays = Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Mañana";
  if (diffDays > 1) return `En ${diffDays} días`;
  if (diffDays === -1) return "Ayer";
  return `Hace ${Math.abs(diffDays)} días`;
}

export async function getStudentNotifications(userId: string): Promise<NotificationItem[]> {
  const [tareas, recordatorios, eventos, proyectos, asignaciones] = await Promise.all([
    prisma.tarea.findMany({
      where: { id_usuario: userId },
      include: { curso: true },
      orderBy: [{ fecha_limite: "asc" }, { fecha_creacion: "desc" }],
      take: 12,
    }),
    prisma.recordatorio.findMany({
      where: { id_usuario: userId, estado: "pendiente" },
      include: { tarea: true, proyecto: true },
      orderBy: { fecha_recordatorio: "asc" },
      take: 8,
    }),
    prisma.eventoCalendario.findMany({
      where: { id_usuario: userId, fecha_inicio: { gte: new Date() } },
      orderBy: { fecha_inicio: "asc" },
      take: 5,
    }),
    prisma.proyecto.findMany({
      where: {
        OR: [{ id_usuario_creador: userId }, { integrantes: { some: { id_usuario: userId } } }],
      },
      include: { tareas: true, recordatorios: true },
      orderBy: { fecha_creacion: "desc" },
      take: 6,
    }),
    prisma.tareaProyecto.findMany({
      where: { id_usuario_asignado: userId },
      include: { proyecto: true },
      orderBy: { fecha_limite: "asc" },
      take: 6,
    }),
  ]);

  const items: NotificationItem[] = [];

  tareas
    .filter((tarea) => tarea.estado_tarea !== "completada" && tarea.fecha_limite)
    .slice(0, 4)
    .forEach((tarea) => {
      const fecha = tarea.fecha_limite as Date;
      items.push({
        id: `tarea-${tarea.id_tarea}`,
        titulo: tarea.estado_tarea === "vencida" ? `Tarea vencida: ${tarea.titulo}` : `Entrega próxima: ${tarea.titulo}`,
        descripcion: tarea.curso ? `${tarea.curso.nombre_curso} · ${tarea.prioridad}` : `Prioridad ${tarea.prioridad}`,
        fechaLabel: relativeLabel(fecha),
        href: `/tareas/${tarea.id_tarea}`,
        tipo: tarea.estado_tarea === "vencida" ? "Tarea vencida" : "Tarea próxima",
        estado: tarea.estado_tarea === "vencida" ? "alerta" : "pendiente",
      });
    });

  recordatorios.slice(0, 3).forEach((recordatorio) => {
    items.push({
      id: `recordatorio-${recordatorio.id_recordatorio}`,
      titulo: `Recordatorio pendiente: ${recordatorio.titulo}`,
      descripcion: recordatorio.descripcion ?? "Debes revisar esta alerta académica.",
      fechaLabel: relativeLabel(new Date(recordatorio.fecha_recordatorio)),
      href: recordatorio.tarea ? `/tareas/${recordatorio.id_tarea}` : recordatorio.proyecto ? `/proyectos/${recordatorio.id_proyecto}` : "/recordatorios",
      tipo: "Recordatorio",
      estado: "info",
    });
  });

  eventos.slice(0, 3).forEach((evento) => {
    items.push({
      id: `evento-${evento.id_evento}`,
      titulo: `Evento próximo: ${evento.titulo}`,
      descripcion: evento.tipo_evento,
      fechaLabel: relativeLabel(new Date(evento.fecha_inicio)),
      href: "/calendario",
      tipo: "Calendario",
      estado: "exito",
    });
  });

  asignaciones.slice(0, 2).forEach((asignacion) => {
    items.push({
      id: `asignacion-${asignacion.id_tarea_proyecto}`,
      titulo: `Tarea de proyecto asignada: ${asignacion.titulo}`,
      descripcion: asignacion.proyecto ? asignacion.proyecto.nombre_proyecto : "Asignación de proyecto",
      fechaLabel: asignacion.fecha_limite ? relativeLabel(new Date(asignacion.fecha_limite)) : "Pendiente",
      href: asignacion.proyecto ? `/proyectos/${asignacion.id_proyecto}` : "/proyectos",
      tipo: "Proyecto",
      estado: "alerta",
    });
  });

  proyectos.slice(0, 2).forEach((proyecto) => {
    if (proyecto.recordatorios.length > 0) {
      items.push({
        id: `proyecto-${proyecto.id_proyecto}`,
        titulo: `Actividad reciente en proyecto: ${proyecto.nombre_proyecto}`,
        descripcion: `${proyecto.tareas.length} tareas y ${proyecto.recordatorios.length} recordatorios activos`,
        fechaLabel: relativeLabel(new Date(proyecto.fecha_creacion)),
        href: `/proyectos/${proyecto.id_proyecto}`,
        tipo: "Proyecto",
        estado: "info",
      });
    }
  });

  return items.slice(0, 10);
}

export async function getAdminNotifications(): Promise<NotificationItem[]> {
  const [usuarios, soporte, pagos, suscripciones, proyectos] = await Promise.all([
    prisma.usuario.findMany({ orderBy: { fecha_registro: "desc" }, take: 6, include: { perfil_estudiante: true } }),
    prisma.consultaSoporte.findMany({ where: { estado_consulta: "pendiente" }, orderBy: { fecha_envio: "desc" }, take: 6, include: { usuario: true } }),
    prisma.pago.findMany({ where: { estado_pago: { in: ["pendiente", "rechazado"] } }, orderBy: { fecha_pago: "desc" }, take: 6, include: { usuario: true } }),
    prisma.suscripcion.findMany({ where: { estado_suscripcion: "activa" }, orderBy: { fecha_inicio: "desc" }, take: 6, include: { usuario: true, plan: true } }),
    prisma.proyecto.findMany({ orderBy: { fecha_creacion: "desc" }, take: 6, include: { creador: true } }),
  ]);

  const items: NotificationItem[] = [];

  usuarios.slice(0, 3).forEach((usuario) => {
    items.push({
      id: `usuario-${usuario.id_usuario}`,
      titulo: `Nuevo usuario registrado: ${usuario.nombres} ${usuario.apellidos}`,
      descripcion: usuario.perfil_estudiante ? usuario.perfil_estudiante.carrera : usuario.rol,
      fechaLabel: relativeLabel(new Date(usuario.fecha_registro)),
      href: "/admin/usuarios",
      tipo: "Usuarios",
      estado: "info",
    });
  });

  soporte.slice(0, 3).forEach((consulta) => {
    items.push({
      id: `soporte-${consulta.id_consulta}`,
      titulo: `Consulta de soporte pendiente: ${consulta.asunto}`,
      descripcion: `${consulta.usuario.nombres} ${consulta.usuario.apellidos}`,
      fechaLabel: relativeLabel(new Date(consulta.fecha_envio)),
      href: "/admin/soporte",
      tipo: "Soporte",
      estado: "pendiente",
    });
  });

  pagos.slice(0, 3).forEach((pago) => {
    items.push({
      id: `pago-${pago.id_pago}`,
      titulo: `Pago ${pago.estado_pago}: ${pago.usuario.nombres} ${pago.usuario.apellidos}`,
      descripcion: `${pago.metodo_pago} · S/ ${Number(pago.monto).toFixed(2)}`,
      fechaLabel: relativeLabel(new Date(pago.fecha_pago)),
      href: "/admin/pagos",
      tipo: "Pagos",
      estado: pago.estado_pago === "rechazado" ? "alerta" : "pendiente",
    });
  });

  suscripciones.slice(0, 2).forEach((suscripcion) => {
    items.push({
      id: `suscripcion-${suscripcion.id_suscripcion}`,
      titulo: `Usuario actualizado a Premium: ${suscripcion.usuario.nombres} ${suscripcion.usuario.apellidos}`,
      descripcion: suscripcion.plan.nombre_plan,
      fechaLabel: relativeLabel(new Date(suscripcion.fecha_inicio)),
      href: "/admin/planes",
      tipo: "Planes",
      estado: "exito",
    });
  });

  proyectos.slice(0, 2).forEach((proyecto) => {
    items.push({
      id: `proyecto-${proyecto.id_proyecto}`,
      titulo: `Nuevo proyecto creado en la plataforma: ${proyecto.nombre_proyecto}`,
      descripcion: `${proyecto.creador.nombres} ${proyecto.creador.apellidos}`,
      fechaLabel: relativeLabel(new Date(proyecto.fecha_creacion)),
      href: "/admin/proyectos",
      tipo: "Proyectos",
      estado: "info",
    });
  });

  return items.slice(0, 10);
}

export async function getStudentOverview(userId: string) {
  const [usuario, tareas, proyectos, recordatorios, eventos, suscripcion, reportes, cursos] = await Promise.all([
    prisma.usuario.findUnique({ where: { id_usuario: userId }, include: { perfil_estudiante: true } }),
    prisma.tarea.findMany({ where: { id_usuario: userId }, include: { curso: true }, orderBy: [{ fecha_limite: "asc" }, { fecha_creacion: "desc" }] }),
    prisma.proyecto.findMany({
      where: {
        OR: [{ id_usuario_creador: userId }, { integrantes: { some: { id_usuario: userId } } }],
      },
      include: {
        curso: true,
        integrantes: { include: { usuario: { select: { nombres: true, apellidos: true, correo: true } } } },
        tareas: true,
        creador: { select: { nombres: true, apellidos: true } },
        recordatorios: true,
      },
      orderBy: { fecha_creacion: "desc" },
    }),
    prisma.recordatorio.findMany({
      where: { id_usuario: userId },
      include: { tarea: { select: { titulo: true } }, proyecto: { select: { nombre_proyecto: true } } },
      orderBy: { fecha_recordatorio: "asc" },
    }),
    prisma.eventoCalendario.findMany({ where: { id_usuario: userId }, orderBy: [{ fecha_inicio: "asc" }] }),
    prisma.suscripcion.findFirst({ where: { id_usuario: userId, estado_suscripcion: "activa" }, include: { plan: true } }),
    prisma.reporteProductividad.findMany({ where: { id_usuario: userId }, orderBy: { fecha_generacion: "desc" } }),
    prisma.curso.findMany({
      where: { id_usuario: userId },
      include: { tareas: true, proyectos: true },
      orderBy: { nombre_curso: "asc" },
    }),
  ]);

  return { usuario, tareas, proyectos, recordatorios, eventos, suscripcion, reportes, cursos };
}

export async function getAdminOverview() {
  const [
    totalUsuarios,
    totalEstudiantes,
    totalAdmins,
    usuariosActivos,
    usuariosInactivos,
    usuariosSuspendidos,
    usuariosGratuitos,
    usuariosPremium,
    totalTareas,
    totalProyectos,
    totalCursos,
    consultasPendientes,
    pagosAprobados,
    pagosPendientes,
    pagosRechazados,
    usuariosRecientes,
    consultasRecientes,
    pagos,
    usuarios,
    tareas,
    proyectos,
    cursos,
    soporte,
    suscripciones,
    reportes,
  ] = await Promise.all([
    prisma.usuario.count(),
    prisma.usuario.count({ where: { rol: "estudiante" } }),
    prisma.usuario.count({ where: { rol: "administrador" } }),
    prisma.usuario.count({ where: { estado: "activo" } }),
    prisma.usuario.count({ where: { estado: "inactivo" } }),
    prisma.usuario.count({ where: { estado: "suspendido" } }),
    prisma.suscripcion.count({ where: { estado_suscripcion: "activa", plan: { tipo_plan: "gratuito" } } }),
    prisma.suscripcion.count({ where: { estado_suscripcion: "activa", plan: { tipo_plan: "premium" } } }),
    prisma.tarea.count(),
    prisma.proyecto.count(),
    prisma.curso.count(),
    prisma.consultaSoporte.count({ where: { estado_consulta: "pendiente" } }),
    prisma.pago.count({ where: { estado_pago: "aprobado" } }),
    prisma.pago.count({ where: { estado_pago: "pendiente" } }),
    prisma.pago.count({ where: { estado_pago: "rechazado" } }),
    prisma.usuario.findMany({
      orderBy: { fecha_registro: "desc" },
      take: 8,
      include: { perfil_estudiante: true, suscripciones: { include: { plan: true }, take: 1, orderBy: { fecha_inicio: "desc" } }, _count: { select: { tareas: true, proyectos_creados: true } } },
    }),
    prisma.consultaSoporte.findMany({
      where: { estado_consulta: "pendiente" },
      orderBy: { fecha_envio: "desc" },
      take: 8,
      include: { usuario: { select: { nombres: true, apellidos: true, correo: true } } },
    }),
    prisma.pago.findMany({ include: { usuario: { select: { nombres: true, apellidos: true, correo: true } }, suscripcion: { include: { plan: true } } }, orderBy: { fecha_pago: "desc" }, take: 20 }),
    prisma.usuario.findMany({ where: { rol: "estudiante" }, include: { perfil_estudiante: true }, orderBy: { fecha_registro: "asc" } }),
    prisma.tarea.findMany({ include: { usuario: { select: { nombres: true, apellidos: true, correo: true } }, curso: true }, orderBy: { fecha_limite: "asc" } }),
    prisma.proyecto.findMany({ include: { creador: { select: { nombres: true, apellidos: true } }, curso: true, integrantes: true, tareas: true }, orderBy: { fecha_creacion: "desc" } }),
    prisma.curso.findMany({ include: { usuario: { select: { nombres: true, apellidos: true, correo: true } }, tareas: true, proyectos: true }, orderBy: { nombre_curso: "asc" } }),
    prisma.consultaSoporte.findMany({ include: { usuario: { select: { nombres: true, apellidos: true, correo: true } } }, orderBy: { fecha_envio: "desc" } }),
    prisma.suscripcion.findMany({ include: { usuario: { select: { nombres: true, apellidos: true, correo: true } }, plan: true }, orderBy: { fecha_inicio: "desc" } }),
    prisma.reporteProductividad.findMany({ include: { usuario: { select: { nombres: true, apellidos: true, correo: true } } }, orderBy: { fecha_generacion: "desc" } }),
  ]);

  const ingresosEstimados = pagos.reduce((sum, pago) => sum + Number(pago.monto), 0);
  return {
    totalUsuarios,
    totalEstudiantes,
    totalAdmins,
    usuariosActivos,
    usuariosInactivos,
    usuariosSuspendidos,
    usuariosGratuitos,
    usuariosPremium,
    totalTareas,
    totalProyectos,
    totalCursos,
    consultasPendientes,
    pagosAprobados,
    pagosPendientes,
    pagosRechazados,
    ingresosEstimados,
    usuariosRecientes,
    consultasRecientes,
    pagos,
    usuarios,
    tareas,
    proyectos,
    cursos,
    soporte,
    suscripciones,
    reportes,
  };
}
