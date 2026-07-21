import Link from "next/link";
import { Users } from "lucide-react";

interface TareaProyecto {
  id_tarea_proyecto: string;
  estado: string;
}

interface Proyecto {
  id_proyecto: string;
  nombre_proyecto: string;
  estado_proyecto: string;
  avance_general: number;
  fecha_entrega: Date | null;
  tareas: TareaProyecto[];
}

interface Props {
  proyectos: Proyecto[];
}

function colorBarra(avance: number): string {
  if (avance >= 80) return "bg-emerald-500";
  if (avance >= 50) return "bg-brand-500";
  if (avance >= 25) return "bg-amber-500";
  return "bg-red-400";
}

export default function ProjectProgressList({ proyectos }: Props) {
  const activos = proyectos
    .filter((p) => p.estado_proyecto !== "completado")
    .slice(0, 3);

  if (activos.length === 0) {
    return (
      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            Proyectos grupales
          </h3>
          {proyectos.length > 3 && (
            <Link
              href="/proyectos"
              className="text-sm text-brand-600 hover:underline dark:text-brand-400"
            >
              Ver todos
            </Link>
          )}
        </div>
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Aún no participas en proyectos grupales.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
          Proyectos grupales
        </h3>
        <Link
          href="/proyectos"
          className="text-sm text-brand-600 hover:underline dark:text-brand-400"
        >
          Ver todos
        </Link>
      </div>
      <div className="space-y-5">
        {activos.map((p) => {
          const pendientes = p.tareas.filter(
            (t) => t.estado !== "completada"
          ).length;
          const completadas = p.tareas.length - pendientes;

          return (
            <div key={p.id_proyecto}>
              <div className="flex items-center justify-between">
                <Link
                  href={`/proyectos/${p.id_proyecto}`}
                  className="text-sm font-medium text-slate-800 transition hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                >
                  {p.nombre_proyecto}
                </Link>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {p.avance_general}%
                </span>
              </div>
              <div className="mt-1.5 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                <div
                  className={`h-full rounded-full transition-all ${colorBarra(p.avance_general)}`}
                  style={{ width: `${p.avance_general}%` }}
                />
              </div>
              <div className="mt-1 flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
                {p.fecha_entrega && (
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300" />
                    {new Date(p.fecha_entrega).toLocaleDateString("es-PE", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                )}
                {pendientes > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
                    {pendientes} pendiente{pendientes !== 1 ? "s" : ""}
                  </span>
                )}
                {completadas > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {completadas} completa{completadas !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
