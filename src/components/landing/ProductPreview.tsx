import { ListChecks, CalendarDays, BarChart3, Users } from "lucide-react";

const previews = [
  {
    icon: ListChecks,
    label: "Próximas entregas",
    value: "4 tareas para esta semana",
    color: "text-brand-600",
  },
  {
    icon: CalendarDays,
    label: "Calendario",
    value: "2 exámenes próximos",
    color: "text-brand-600",
  },
  {
    icon: BarChart3,
    label: "Progreso semanal",
    value: "67 % de cumplimiento",
    color: "text-brand-600",
  },
  {
    icon: Users,
    label: "Proyectos activos",
    value: "3 proyectos en curso",
    color: "text-brand-600",
  },
];

export default function ProductPreview() {
  return (
    <section className="border-t border-slate-100 bg-white py-12 dark:border-white/5 dark:bg-slate-950/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-lg font-semibold text-slate-700 dark:text-slate-300">
          Tu panorama académico en tiempo real
        </h2>
        <p className="mx-auto mt-1 max-w-xl text-center text-sm text-slate-500 dark:text-slate-400">
          Información de ejemplo basada en el funcionamiento real de la
          plataforma.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {previews.map((p) => (
            <div
              key={p.label}
              className="card flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <p.icon size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {p.label}
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {p.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
