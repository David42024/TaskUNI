import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/session";
import CardResumen from "@/components/CardResumen";
import GraficoProductividad from "@/components/GraficoProductividad";
import { ListChecks, Clock, CheckCircle2, Users, CalendarClock } from "lucide-react";

export default async function DashboardEstudiante() {
  const user = await requireUsuario();

  const [tareas, proyectos, proximosEventos, suscripcion] = await Promise.all([
    prisma.tarea.findMany({ where: { id_usuario: user.id } }),
    prisma.proyecto.findMany({
      where: {
        OR: [
          { id_usuario_creador: user.id },
          { integrantes: { some: { id_usuario: user.id } } },
        ],
      },
    }),
    prisma.eventoCalendario.findMany({
      where: { id_usuario: user.id, fecha_inicio: { gte: new Date() } },
      orderBy: { fecha_inicio: "asc" },
      take: 5,
    }),
    prisma.suscripcion.findFirst({
      where: { id_usuario: user.id, estado_suscripcion: "activa" },
      include: { plan: true },
    }),
  ]);

  const pendientes = tareas.filter((t) => t.estado_tarea === "pendiente").length;
  const enProgreso = tareas.filter((t) => t.estado_tarea === "en_progreso").length;
  const completadas = tareas.filter((t) => t.estado_tarea === "completada").length;
  const vencidas = tareas.filter((t) => t.estado_tarea === "vencida").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hola, {user.name?.split(" ")[0]} 👋</h1>
          <p className="text-slate-500 dark:text-slate-400">Este es el resumen de tu actividad académica.</p>
        </div>
        <span className="badge bg-brand-100 text-brand-700">
          Plan {suscripcion?.plan.nombre_plan ?? "Gratuito"}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardResumen titulo="Tareas pendientes" valor={pendientes} icon={ListChecks} color="slate" />
        <CardResumen titulo="En progreso" valor={enProgreso} icon={Clock} color="amber" />
        <CardResumen titulo="Completadas" valor={completadas} icon={CheckCircle2} color="green" />
        <CardResumen titulo="Proyectos activos" valor={proyectos.length} icon={Users} color="brand" />
      </div>

      <GraficoProductividad
        completadas={completadas}
        pendientes={pendientes}
        enProgreso={enProgreso}
        vencidas={vencidas}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Próximas fechas</h3>
            <Link href="/calendario" className="text-sm text-brand-600 hover:underline dark:text-brand-300">
              Ver calendario
            </Link>
          </div>
          {proximosEventos.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">No tienes eventos próximos registrados.</p>
          ) : (
            <ul className="space-y-3">
              {proximosEventos.map((ev) => (
                <li key={ev.id_evento} className="flex items-start gap-3">
                  <CalendarClock size={18} className="mt-0.5 text-brand-600" />
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">{ev.titulo}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(ev.fecha_inicio).toLocaleDateString("es-PE", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Proyectos grupales</h3>
            <Link href="/proyectos" className="text-sm text-brand-600 hover:underline dark:text-brand-300">
              Ver todos
            </Link>
          </div>
          {proyectos.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">Aún no participas en proyectos grupales.</p>
          ) : (
            <ul className="space-y-4">
              {proyectos.slice(0, 4).map((p) => (
                <li key={p.id_proyecto}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-800 dark:text-white">{p.nombre_proyecto}</span>
                    <span className="text-slate-400 dark:text-slate-500">{p.avance_general}%</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${p.avance_general}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
