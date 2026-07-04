import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";
import StudentChrome from "@/components/StudentChrome";
import { getStudentNotifications } from "@/lib/taskuni-data";

export default async function EstudianteLayout({ children }: { children: React.ReactNode }) {
  const session = await getSesionActual();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.rol === "administrador") {
    redirect("/admin");
  }

  const [usuario, tareas, suscripcion, proyectos, notificacionesItems] = await Promise.all([
    prisma.usuario.findUnique({
      where: { id_usuario: session.user.id },
      include: { perfil_estudiante: true },
    }),
    prisma.tarea.findMany({
      where: { id_usuario: session.user.id },
      select: { estado_tarea: true, fecha_limite: true, fecha_actualizacion: true },
    }),
    prisma.suscripcion.findFirst({
      where: { id_usuario: session.user.id, estado_suscripcion: "activa" },
      include: { plan: true },
    }),
    prisma.proyecto.findMany({
      where: {
        OR: [
          { id_usuario_creador: session.user.id },
          { integrantes: { some: { id_usuario: session.user.id } } },
        ],
      },
      select: { id_proyecto: true },
    }),
    getStudentNotifications(session.user.id),
  ]);

  if (!usuario) {
    redirect("/login");
  }

  const hoy = new Date();
  const dentroDeSieteDias = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
  const tareasPendientes = tareas.filter((tarea) => tarea.estado_tarea === "pendiente").length;
  const entregasProximas = tareas.filter(
    (tarea) =>
      tarea.fecha_limite !== null &&
      tarea.fecha_limite >= hoy &&
      tarea.fecha_limite <= dentroDeSieteDias &&
      tarea.estado_tarea !== "completada"
  ).length;
  const rachaDias = Math.max(
    1,
    tareas.filter(
      (tarea) =>
        tarea.estado_tarea === "completada" &&
        tarea.fecha_actualizacion >= new Date(hoy.getTime() - 6 * 24 * 60 * 60 * 1000)
    ).length || 4
  );
  const carrera = usuario.perfil_estudiante?.carrera ?? "Ingeniería de Sistemas";
  const ciclo = usuario.perfil_estudiante?.ciclo_academico ?? "Ciclo I";
  const planActual = suscripcion?.plan.nombre_plan ?? "Plan Gratuito";

  return (
    <StudentChrome
      header={{
        nombre: `${usuario.nombres} ${usuario.apellidos}`,
        carrera,
        ciclo,
        tareasPendientes,
        entregasProximas,
        rachaDias,
        notificacionesItems,
        planActual,
      }}
      sidebar={{
        nombre: `${usuario.nombres} ${usuario.apellidos}`,
        planActual,
        tareasBadge: tareasPendientes,
        recordatoriosBadge: Math.max(3, entregasProximas),
        proyectosBadge: Math.max(2, proyectos.length),
      }}
    >
      {children}
    </StudentChrome>
  );
}
