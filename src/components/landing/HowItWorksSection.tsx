import { UserPlus, LayoutDashboard, LineChart } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    titulo: "Crea tu cuenta",
    texto: "Regístrate gratuitamente en pocos minutos.",
  },
  {
    icon: LayoutDashboard,
    titulo: "Organiza tus cursos",
    texto: "Registra tareas, entregas, proyectos y fechas importantes.",
  },
  {
    icon: LineChart,
    titulo: "Controla tu progreso",
    texto:
      "Consulta tus pendientes, recordatorios y productividad desde el dashboard.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="como-funciona" className="scroll-mt-20 bg-white py-16 dark:bg-slate-950/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">
          Cómo funciona
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-600 dark:text-slate-400">
          Empezar a organizar tu semestre es más fácil de lo que imaginas.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.titulo} className="relative text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <step.icon size={26} />
              </div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
                {step.titulo}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {step.texto}
              </p>
              {i < steps.length - 1 && (
                <div
                  className="absolute right-0 top-7 hidden h-px w-[calc(50%-2rem)] bg-slate-200 sm:block dark:bg-white/10"
                  aria-hidden
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
