import Link from "next/link";
import { AlertTriangle, Calendar, ArrowUp } from "lucide-react";

interface Tarea {
  id_tarea: string;
  titulo: string;
  descripcion: string | null;
  fecha_limite: Date | null;
  prioridad: string;
  estado_tarea: string;
  curso: { nombre_curso: string } | null;
}

interface Props {
  tareas: Tarea[];
}

export default function PriorityTasksList({ tareas }: Props) {
  const ahora = new Date();
  const manana = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

  const prioritarias = tareas
    .filter((t) => t.estado_tarea !== "completada")
    .sort((a, b) => {
      const scoreA = puntajePrioridad(a, ahora, manana);
      const scoreB = puntajePrioridad(b, ahora, manana);
      return scoreB - scoreA;
    })
    .slice(0, 6);

  if (prioritarias.length === 0) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
          Prioridades de hoy
        </h2>
        <p className="mt-3 text-sm text-slate-400 dark:text-slate-500">
          No tienes actividades urgentes por ahora.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
          Prioridades de hoy
        </h2>
        <Link
          href="/tareas"
          className="text-sm text-brand-600 hover:underline dark:text-brand-400"
        >
          Ver todas
        </Link>
      </div>
      <ul className="divide-y divide-slate-100 dark:divide-white/5">
        {prioritarias.map((t) => {
          const vencida = t.estado_tarea === "vencida";
          const venceHoy =
            t.fecha_limite &&
            t.fecha_limite.toDateString() === ahora.toDateString();
          const cursoNombre = t.curso?.nombre_curso;

          return (
            <li key={t.id_tarea} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  vencida
                    ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                    : venceHoy
                      ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                      : t.prioridad === "alta"
                        ? "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                        : "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"
                }`}
              >
                {vencida ? (
                  <AlertTriangle size={14} />
                ) : venceHoy ? (
                  <Calendar size={14} />
                ) : (
                  <ArrowUp size={14} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {t.titulo}
                  </p>
                  <span
                    className={`shrink-0 text-xs font-medium ${
                      vencida
                        ? "text-red-600 dark:text-red-400"
                        : venceHoy
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {vencida
                      ? "Vencida"
                      : venceHoy
                        ? "Hoy"
                        : t.fecha_limite
                          ? `En ${diasRestantes(t.fecha_limite)}d`
                          : ""}
                  </span>
                </div>
                <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {cursoNombre && <span>{cursoNombre}</span>}
                  {t.prioridad && (
                    <span
                      className={`capitalize ${
                        t.prioridad === "alta"
                          ? "font-medium text-red-500 dark:text-red-400"
                          : t.prioridad === "media"
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-slate-400"
                      }`}
                    >
                      {t.prioridad}
                    </span>
                  )}
                </div>
              </div>
              <Link
                href={`/tareas/${t.id_tarea}`}
                className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium text-brand-600 transition hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
              >
                Abrir
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function puntajePrioridad(
  t: Tarea,
  ahora: Date,
  manana: Date
): number {
  let score = 0;
  if (t.estado_tarea === "vencida") score += 100;
  if (
    t.fecha_limite &&
    t.fecha_limite <= manana &&
    t.fecha_limite >= ahora
  )
    score += 80;
  if (t.prioridad === "alta") score += 50;
  if (t.prioridad === "media") score += 20;
  if (t.fecha_limite) {
    const diff = (t.fecha_limite.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24);
    if (diff > 1 && diff <= 3) score += 40;
    if (diff > 3 && diff <= 7) score += 15;
  }
  return score;
}

function diasRestantes(fecha: Date): number {
  const diff = fecha.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
