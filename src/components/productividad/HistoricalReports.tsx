interface Reporte {
  id_reporte: string;
  periodo: string;
  total_tareas: number;
  tareas_completadas: number;
  tareas_pendientes: number;
  tareas_vencidas: number;
  porcentaje_cumplimiento: number;
  racha_productividad: number;
  fecha_generacion: Date;
}

interface Props {
  reportes: Reporte[];
}

function calcularVariacion(reportes: Reporte[], i: number): number | null {
  if (i >= reportes.length - 1) return null;
  const actual = reportes[i].porcentaje_cumplimiento;
  const anterior = reportes[i + 1].porcentaje_cumplimiento;
  return actual - anterior;
}

export default function HistoricalReports({ reportes }: Props) {
  const recientes = reportes.slice(0, 10);

  if (recientes.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
          Reportes históricos
        </h3>
        <p className="mt-4 text-sm text-slate-400">
          Aún no hay reportes generados.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">
        Reportes históricos
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-white/10 dark:text-slate-400">
              <th className="pb-2 pr-4 font-medium">Periodo</th>
              <th className="pb-2 pr-4 font-medium">Actividades</th>
              <th className="pb-2 pr-4 font-medium">Completadas</th>
              <th className="pb-2 pr-4 font-medium">Cumplimiento</th>
              <th className="pb-2 pr-4 font-medium">Variación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {recientes.map((r, i) => {
              const variacion = calcularVariacion(recientes, i);
              return (
                <tr
                  key={r.id_reporte}
                  className="text-slate-700 dark:text-slate-300"
                >
                  <td className="py-2.5 pr-4 font-medium text-slate-900 dark:text-white">
                    {r.periodo}
                  </td>
                  <td className="py-2.5 pr-4 text-slate-500">
                    {r.total_tareas}
                  </td>
                  <td className="py-2.5 pr-4 text-slate-500">
                    {r.tareas_completadas}
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${r.porcentaje_cumplimiento}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {r.porcentaje_cumplimiento}%
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-4">
                    {variacion !== null ? (
                      <span
                        className={`text-xs font-medium ${
                          variacion >= 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {variacion > 0 ? "+" : ""}
                        {variacion}%
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
