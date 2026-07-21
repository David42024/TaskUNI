interface Tarea {
  id_tarea: string;
  estado_tarea: string;
  fecha_limite: Date | null;
  fecha_actualizacion: Date;
  completedAt?: Date | null;
}

interface Props {
  completadas: Tarea[];
  vencidas: Tarea[];
  completadasSemanaPasada: number;
}

function getCompletionDate(t: Tarea): Date {
  return t.completedAt ? new Date(t.completedAt) : new Date(t.fecha_actualizacion);
}

export default function DeliveryPunctuality({
  completadas,
  vencidas,
  completadasSemanaPasada,
}: Props) {
  const antesPlazo = completadas.filter((t) => {
    if (!t.fecha_limite) return true;
    return getCompletionDate(t) < new Date(t.fecha_limite);
  }).length;

  const mismoDia = completadas.filter((t) => {
    if (!t.fecha_limite) return false;
    const fin = new Date(t.fecha_limite);
    const completado = getCompletionDate(t);
    return (
      completado >= fin &&
      completado.getTime() - fin.getTime() < 24 * 60 * 60 * 1000
    );
  }).length;

  const tarde = completadas.length - antesPlazo - mismoDia;
  const total = completadas.length + vencidas.length;

  const stats = [
    {
      label: "Antes del plazo",
      valor: antesPlazo,
      color: "bg-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Mismo día",
      valor: mismoDia,
      color: "bg-brand-500",
      textColor: "text-brand-600 dark:text-brand-400",
    },
    {
      label: "Después del plazo",
      valor: Math.max(0, tarde),
      color: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Vencidas sin entregar",
      valor: vencidas.length,
      color: "bg-red-500",
      textColor: "text-red-600 dark:text-red-400",
    },
  ];

  if (total === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
          Puntualidad de entregas
        </h3>
        <p className="mt-4 text-sm text-slate-400">
          No hay entregas registradas.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">
        Puntualidad de entregas
      </h3>
      <div className="space-y-3">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                {s.label}
              </span>
              <span className={`font-medium ${s.textColor}`}>
                {s.valor}
                {total > 0 && (
                  <span className="ml-1 text-xs text-slate-400 dark:text-slate-500">
                    ({Math.round((s.valor / total) * 100)}%)
                  </span>
                )}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div
                className={`h-full rounded-full ${s.color} transition-all`}
                style={{
                  width: `${total > 0 ? (s.valor / total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
