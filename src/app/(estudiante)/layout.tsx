import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";
import StudentChrome from "@/components/StudentChrome";
import { getStudentNotifications } from "@/lib/taskuni-data";

const DEFAULT_HEADER = {
  nombre: "Usuario",
  carrera: "",
  ciclo: "",
  tareasPendientes: 0,
  entregasProximas: 0,
  rachaDias: 1,
  notificacionesItems: [],
  planActual: "Plan Gratuito",
};

const DEFAULT_SIDEBAR = {
  nombre: "Usuario",
  planActual: "Plan Gratuito",
  esGratuito: true,
  tareasBadge: 0,
  recordatoriosBadge: 0,
  proyectosBadge: 0,
};

export default async function EstudianteLayout({ children }: { children: React.ReactNode }) {
  try {
    const session = await getSesionActual();
    const userId = session?.user?.id;

    if (!userId) {
      return (
        <StudentChrome header={DEFAULT_HEADER} sidebar={DEFAULT_SIDEBAR}>
          {children}
        </StudentChrome>
      );
    }

    if (session.user.rol === "administrador") {
      const { redirect } = await import("next/navigation");
      redirect("/admin");
    }

    const [usuario, tareas, suscripcion, proyectos, notificacionesItems] = await Promise.all([
      prisma.usuario.findUnique({
        where: { id_usuario: userId },
        include: { perfil_estudiante: true },
      }),
      prisma.tarea.findMany({
        where: { id_usuario: userId },
        select: { estado_tarea: true, fecha_limite: true, fecha_actualizacion: true },
      }),
      prisma.suscripcion.findFirst({
        where: { id_usuario: userId, estado_suscripcion: "activa" },
        include: { plan: true },
      }),
      prisma.proyecto.findMany({
        where: {
          OR: [
            { id_usuario_creador: userId },
            { integrantes: { some: { id_usuario: userId } } },
          ],
        },
        select: { id_proyecto: true },
      }),
      getStudentNotifications(userId),
    ]);

    if (!usuario) {
      return (
        <StudentChrome header={DEFAULT_HEADER} sidebar={DEFAULT_SIDEBAR}>
          {children}
        </StudentChrome>
      );
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
    const esGratuito = suscripcion?.plan.tipo_plan !== "premium";

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
          esGratuito,
          tareasBadge: tareasPendientes,
          recordatoriosBadge: Math.max(3, entregasProximas),
          proyectosBadge: Math.max(2, proyectos.length),
        }}
      >
        {children}
      </StudentChrome>
    );
  } catch {
    return (
      <StudentChrome header={DEFAULT_HEADER} sidebar={DEFAULT_SIDEBAR}>
        {children}
      </StudentChrome>
    );
  }
}
