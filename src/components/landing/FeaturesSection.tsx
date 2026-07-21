import {
  ListChecks,
  Users,
  CalendarDays,
  Bell,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: ListChecks,
    titulo: "Gestión de tareas",
    descripcion:
      "Crea, prioriza y da seguimiento a tus actividades por curso y fecha límite.",
    priority: true,
  },
  {
    icon: Users,
    titulo: "Proyectos grupales",
    descripcion:
      "Coordina equipos, asigna responsabilidades y visualiza el progreso en tableros Kanban.",
    priority: true,
  },
  {
    icon: CalendarDays,
    titulo: "Calendario académico",
    descripcion:
      "Consulta entregas, exámenes y reuniones desde un calendario centralizado.",
    priority: true,
  },
  {
    icon: Bell,
    titulo: "Recordatorios inteligentes",
    descripcion:
      "Recibe alertas antes de que tus actividades y proyectos venzan.",
    priority: true,
  },
  {
    icon: BarChart3,
    titulo: "Reportes de productividad",
    descripcion:
      "Analiza tu cumplimiento, rachas de trabajo y progreso semanal.",
    priority: false,
  },
  {
    icon: ShieldCheck,
    titulo: "Seguridad de tus datos",
    descripcion:
      "Protección de cuentas, contraseñas cifradas y control de acceso por roles.",
    priority: false,
  },
];

export default function FeaturesSection() {
  return (
    <section id="funciones" className="scroll-mt-20 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">
          Funciones principales
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-600 dark:text-slate-400">
          Todo lo que necesitas para mantener el control de tus estudios y tus
          equipos.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.titulo}
              className={
                f.priority
                  ? "card transition-shadow hover:shadow-md"
                  : "card border-slate-100 bg-slate-50/50 transition-shadow hover:shadow-md dark:border-white/5 dark:bg-white/[0.03]"
              }
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                <f.icon size={22} />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                {f.titulo}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {f.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
