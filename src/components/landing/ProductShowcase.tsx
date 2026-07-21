import { ListChecks, Columns3, CalendarDays } from "lucide-react";

const showcases = [
  {
    icon: ListChecks,
    titulo: "Todo tu semestre de un vistazo",
    descripcion:
      "El dashboard académico reúne tus tareas pendientes, próximas entregas y métricas de productividad.",
  },
  {
    icon: Columns3,
    titulo: "Coordina trabajos grupales",
    descripcion:
      "Los tableros Kanban permiten asignar tareas y visualizar el avance de cada integrante.",
  },
  {
    icon: CalendarDays,
    titulo: "Anticipa tus próximas entregas",
    descripcion:
      "El calendario centralizado muestra todas tus fechas límite, exámenes y reuniones.",
  },
];

export default function ProductShowcase() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">
          Demostración visual del sistema
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-600 dark:text-slate-400">
          Conoce las pantallas principales que usarás durante tu semestre.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {showcases.map((s) => (
            <div key={s.titulo} className="card">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <s.icon size={24} />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                {s.titulo}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {s.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
