import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/session";
import GraficoProductividad from "@/components/GraficoProductividad";
import CardResumen from "@/components/CardResumen";
import { BarChart3, CheckCircle2, Clock3, Target } from "lucide-react";

export default async function ProductividadPage() {
  const user = await requireUsuario();

  const [tareas, reportes] = await Promise.all([
    prisma.tarea.findMany({ where: { id_usuario: user.id } }),
    prisma.reporteProductividad.findMany({ where: { id_usuario: user.id }, orderBy: { fecha_generacion: "desc" } }),
  ]);

  const completadas = tareas.filter((t) => t.estado_tarea === "completada").length;
  const pendientes = tareas.filter((t) => t.estado_tarea === "pendiente").length;
  const enProgreso = tareas.filter((t) => t.estado_tarea === "en_progreso").length;
  const vencidas = tareas.filter((t) => t.estado_tarea === "vencida").length;
  const ultimoReporte = reportes[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Productividad</h1>
        <p className="text-slate-500 dark:text-slate-400">Racha, cumplimiento y tendencias de tus reportes.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardResumen titulo="Cumplimiento" valor={`${ultimoReporte?.porcentaje_cumplimiento ?? 0}%`} icon={Target} color="brand" />
        <CardResumen titulo="Racha" valor={`${ultimoReporte?.racha_productividad ?? 0} días`} icon={BarChart3} color="green" />
        <CardResumen titulo="Tareas completadas" valor={completadas} icon={CheckCircle2} color="emerald" />
        <CardResumen titulo="Tareas vencidas" valor={vencidas} icon={Clock3} color="red" />
      </div>

      <GraficoProductividad completadas={completadas} pendientes={pendientes} enProgreso={enProgreso} vencidas={vencidas} />

      <div className="card">
        <h3 className="mb-3 text-lg font-semibold text-slate-800 dark:text-white">Reportes recientes</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {reportes.map((reporte) => (
            <div key={reporte.id_reporte} className="rounded-2xl border border-slate-200 p-4 dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{reporte.periodo}</p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Total: {reporte.total_tareas}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Completadas: {reporte.tareas_completadas}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cumplimiento: {reporte.porcentaje_cumplimiento}%</p>
              <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-white/10">
                <div className="h-2 rounded-full bg-brand-500" style={{ width: `${reporte.porcentaje_cumplimiento}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
