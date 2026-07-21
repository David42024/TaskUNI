import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/session";
import PremiumGate from "@/components/productividad/PremiumGate";
import ProductivityFilters from "@/components/productividad/ProductivityFilters";
import MetricCard from "@/components/productividad/MetricCard";
import TrendChart from "@/components/productividad/TrendChart";
import CoursePerformance from "@/components/productividad/CoursePerformance";
import StatusDistribution from "@/components/productividad/StatusDistribution";
import WeeklyActivity from "@/components/productividad/WeeklyActivity";
import DeliveryPunctuality from "@/components/productividad/DeliveryPunctuality";
import HistoricalReports from "@/components/productividad/HistoricalReports";
import PerformanceObservations from "@/components/productividad/PerformanceObservations";
import { Target, TrendingUp, Flame, BarChart3 } from "lucide-react";

export default async function ProductividadPage() {
  const user = await requireUsuario();

  const [suscripcion, tareas, reportes, cursos] = await Promise.all([
    prisma.suscripcion.findFirst({
      where: { id_usuario: user.id, estado_suscripcion: "activa" },
      include: { plan: true },
    }),
    prisma.tarea.findMany({
      where: { id_usuario: user.id },
      select: {
        id_tarea: true,
        titulo: true,
        estado_tarea: true,
        prioridad: true,
        fecha_creacion: true,
        fecha_actualizacion: true,
        fecha_limite: true,
        completedAt: true,
        curso: { select: { nombre_curso: true } },
      },
      orderBy: { fecha_creacion: "desc" },
    }),
    prisma.reporteProductividad.findMany({
      where: { id_usuario: user.id },
      orderBy: { fecha_generacion: "desc" },
    }),
    prisma.curso.findMany({
      where: { id_usuario: user.id },
      select: {
        id_curso: true,
        nombre_curso: true,
        tareas: {
          select: {
            id_tarea: true,
            titulo: true,
            estado_tarea: true,
            fecha_limite: true,
            fecha_actualizacion: true,
            curso: { select: { nombre_curso: true } },
          },
        },
      },
      orderBy: { nombre_curso: "asc" },
    }),
  ]);

  const esPremium = suscripcion?.plan.tipo_plan === "premium";

  if (!esPremium) {
    return <PremiumGate />;
  }

  const tareasSimples = tareas.map((t) => ({
    id_tarea: t.id_tarea,
    titulo: t.titulo,
    estado_tarea: t.estado_tarea,
    fecha_creacion: t.fecha_creacion,
    fecha_actualizacion: t.fecha_actualizacion,
    fecha_limite: t.fecha_limite,
    completedAt: t.completedAt,
    prioridad: t.prioridad,
    curso: t.curso ? { nombre_curso: t.curso.nombre_curso } : null,
  }));

  const cursosSimples = cursos.map((c) => ({
    id_curso: c.id_curso,
    nombre_curso: c.nombre_curso,
    tareas: c.tareas.map((t) => ({
      id_tarea: t.id_tarea,
      titulo: t.titulo,
      estado_tarea: t.estado_tarea,
      fecha_limite: t.fecha_limite,
      fecha_actualizacion: t.fecha_actualizacion,
      curso: t.curso ? { nombre_curso: t.curso.nombre_curso } : null,
    })),
  }));

  const completadas = tareas.filter((t) => t.estado_tarea === "completada");
  const pendientes = tareas.filter((t) => t.estado_tarea === "pendiente");
  const enProgreso = tareas.filter((t) => t.estado_tarea === "en_progreso");
  const vencidas = tareas.filter((t) => t.estado_tarea === "vencida");
  const total = tareas.length;

  const cumplimiento = total > 0 ? Math.round((completadas.length / total) * 100) : 0;

  const aTiempo = completadas.filter((t) => {
    if (!t.fecha_limite) return true;
    return t.fecha_actualizacion <= t.fecha_limite;
  }).length;

  const entregasATiempo = completadas.length > 0
    ? Math.round((aTiempo / completadas.length) * 100)
    : 0;

  const ultimoReporte = reportes[0];
  const racha = ultimoReporte?.racha_productividad ?? 0;

  const reporteAnterior = reportes[1];
  const variacion = reporteAnterior && ultimoReporte
    ? ultimoReporte.porcentaje_cumplimiento - reporteAnterior.porcentaje_cumplimiento
    : null;

  const fechaSemanaPasada = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const completadasSemanaPasada = tareas.filter(
    (t) =>
      t.estado_tarea === "completada" &&
      t.fecha_actualizacion >= fechaSemanaPasada
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Productividad
            </h1>
            <span className="badge bg-brand-100 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
              Premium
            </span>
          </div>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Analiza tu rendimiento, cumplimiento y hábitos académicos.
          </p>
        </div>
        <ProductivityFilters />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          titulo="Cumplimiento"
          valor={`${cumplimiento}%`}
          icon={Target}
          color="brand"
          subtitulo={`${completadas.length} de ${total} tareas`}
        />
        <MetricCard
          titulo="Entregas a tiempo"
          valor={`${entregasATiempo}%`}
          icon={TrendingUp}
          color="green"
          subtitulo={`${aTiempo} de ${completadas.length} completadas`}
        />
        <MetricCard
          titulo="Racha actual"
          valor={`${racha} días`}
          icon={Flame}
          color="amber"
        />
        <MetricCard
          titulo="Variación"
          valor={
            variacion !== null
              ? `${variacion > 0 ? "+" : ""}${variacion}%`
              : "—"
          }
          icon={BarChart3}
          color={variacion !== null && variacion >= 0 ? "green" : "red"}
          subtitulo="frente al periodo anterior"
        />
      </div>

      <TrendChart tareas={tareasSimples} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CoursePerformance cursos={cursosSimples} />
        <StatusDistribution
          completadas={completadas.length}
          pendientes={pendientes.length}
          enProgreso={enProgreso.length}
          vencidas={vencidas.length}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <WeeklyActivity tareas={tareasSimples} />
        <DeliveryPunctuality
          completadas={completadas}
          vencidas={vencidas}
          completadasSemanaPasada={completadasSemanaPasada}
        />
      </div>

      <HistoricalReports reportes={reportes} />

      <PerformanceObservations
        tareas={tareasSimples}
        cursos={cursosSimples}
        cumplimiento={cumplimiento}
        racha={racha}
        variacion={variacion}
        completadasSemanaPasada={completadasSemanaPasada}
      />
    </div>
  );
}
