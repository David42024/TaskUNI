import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/session";
import CardResumen from "@/components/CardResumen";
import PriorityTasksList from "@/components/dashboard/PriorityTasksList";
import WeeklyTaskSummaryChart from "@/components/dashboard/WeeklyTaskSummaryChart";
import UpcomingLoadChart from "@/components/dashboard/UpcomingLoadChart";
import UpcomingEvents from "@/components/dashboard/UpcomingEvents";
import ProjectProgressList from "@/components/dashboard/ProjectProgressList";
import ProductivityAccessCard from "@/components/dashboard/ProductivityAccessCard";
import { ListChecks, Clock, CheckCircle2, Users } from "lucide-react";

export default async function DashboardEstudiante() {
  const user = await requireUsuario();

  const [tareas, proyectos, proximosEventos, suscripcion, reportes] =
    await Promise.all([
      prisma.tarea.findMany({
        where: { id_usuario: user.id },
        select: {
          id_tarea: true,
          titulo: true,
          descripcion: true,
          fecha_limite: true,
          prioridad: true,
          estado_tarea: true,
          fecha_creacion: true,
          fecha_actualizacion: true,
          completedAt: true,
          curso: { select: { nombre_curso: true } },
        },
        orderBy: [{ fecha_limite: "asc" }, { prioridad: "asc" }],
      }),
      prisma.proyecto.findMany({
        where: {
          OR: [
            { id_usuario_creador: user.id },
            { integrantes: { some: { id_usuario: user.id } } },
          ],
        },
        include: { tareas: true },
        orderBy: { fecha_creacion: "desc" },
      }),
      prisma.eventoCalendario.findMany({
        where: { id_usuario: user.id, fecha_inicio: { gte: new Date() } },
        orderBy: { fecha_inicio: "asc" },
        take: 8,
      }),
      prisma.suscripcion.findFirst({
        where: { id_usuario: user.id, estado_suscripcion: "activa" },
        include: { plan: true },
      }),
      prisma.reporteProductividad.findMany({
        where: { id_usuario: user.id },
        orderBy: { fecha_generacion: "desc" },
        take: 7,
      }),
    ]);

  const tareasSimples = tareas.map((t) => ({
    id_tarea: t.id_tarea,
    titulo: t.titulo,
    descripcion: t.descripcion,
    fecha_limite: t.fecha_limite,
    prioridad: t.prioridad,
    estado_tarea: t.estado_tarea,
    fecha_actualizacion: t.fecha_actualizacion,
    curso: t.curso ? { nombre_curso: t.curso.nombre_curso } : null,
  }));

  const pendientes = tareas.filter((t) => t.estado_tarea === "pendiente").length;
  const enProgreso = tareas.filter((t) => t.estado_tarea === "en_progreso").length;
  const completadasSemana = tareas.filter(
    (t) =>
      t.estado_tarea === "completada" &&
      t.fecha_actualizacion >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;
  const completadas = tareas.filter((t) => t.estado_tarea === "completada").length;
  const vencidas = tareas.filter((t) => t.estado_tarea === "vencida").length;
  const total = tareas.length;
  const cumplimiento = total > 0 ? Math.round((completadas / total) * 100) : 0;

  const esPremium = suscripcion?.plan.tipo_plan === "premium";
  const planNombre = suscripcion?.plan.nombre_plan ?? "Plan Gratuito";
  const ultimoReporte = reportes[0];
  const racha = ultimoReporte?.racha_productividad ?? 0;
  const reportesSemana = reportes
    .slice()
    .reverse()
    .map((r) => r.porcentaje_cumplimiento);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Hola, {user.name?.split(" ")[0]}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Este es el resumen de tu actividad académica.
          </p>
        </div>
        <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
          {planNombre}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardResumen titulo="Tareas pendientes" valor={pendientes} icon={ListChecks} color="slate" />
        <CardResumen titulo="Tareas en progreso" valor={enProgreso} icon={Clock} color="amber" />
        <CardResumen titulo="Completadas esta semana" valor={completadasSemana} icon={CheckCircle2} color="green" />
        <CardResumen titulo="Proyectos activos" valor={proyectos.length} icon={Users} color="brand" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WeeklyTaskSummaryChart
          pendientes={pendientes}
          enProgreso={enProgreso}
          completadas={completadasSemana}
          vencidas={vencidas}
        />
        <UpcomingLoadChart tareas={tareas} eventos={proximosEventos} />
      </div>

      <PriorityTasksList tareas={tareasSimples} />

      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingEvents eventos={proximosEventos} />
        <ProjectProgressList proyectos={proyectos} />
      </div>

      <ProductivityAccessCard
        esPremium={esPremium}
        cumplimiento={esPremium ? cumplimiento : undefined}
        racha={esPremium ? racha : undefined}
        reportesSemana={esPremium ? reportesSemana : undefined}
      />
    </div>
  );
}
