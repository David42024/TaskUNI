interface Tarea {
  id_tarea: string;
  estado_tarea: string;
}

interface Curso {
  id_curso: string;
  nombre_curso: string;
  tareas: Tarea[];
}

interface Props {
  cursos: Curso[];
}

export default function CoursePerformance({ cursos }: Props) {
  const datos = cursos
    .map((c) => {
      const total = c.tareas.length;
      const completadas = c.tareas.filter(
        (t) => t.estado_tarea === "completada"
      ).length;
      const vencidas = c.tareas.filter(
        (t) => t.estado_tarea === "vencida"
      ).length;
      const cumplimiento = total > 0 ? Math.round((completadas / total) * 100) : 0;
      return { nombre: c.nombre_curso, total, completadas, vencidas, cumplimiento };
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => a.cumplimiento - b.cumplimiento);

  if (datos.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
          Rendimiento por curso
        </h3>
        <p className="mt-4 text-sm text-slate-400">
          No hay datos de cursos para mostrar.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">
        Rendimiento por curso
      </h3>
      <div className="space-y-4">
        {datos.map((c) => (
          <div key={c.nombre}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {c.nombre}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {c.completadas}/{c.total} · {c.cumplimiento}%
              </span>
            </div>
            <div className="flex h-5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${c.cumplimiento}%` }}
                title={`${c.cumplimiento}% completado`}
              />
              {c.vencidas > 0 && (
                <div
                  className="h-full bg-red-400"
                  style={{
                    width: `${Math.round((c.vencidas / c.total) * 100)}%`,
                  }}
                  title={`${c.vencidas} vencidas`}
                />
              )}
            </div>
            <div className="mt-0.5 flex gap-3 text-xs text-slate-400 dark:text-slate-500">
              {c.vencidas > 0 && (
                <span className="text-red-500 dark:text-red-400">
                  {c.vencidas} vencida{c.vencidas !== 1 ? "s" : ""}
                </span>
              )}
              <span>
                {c.total - c.completadas - c.vencidas} pendiente
                {c.total - c.completadas - c.vencidas !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
