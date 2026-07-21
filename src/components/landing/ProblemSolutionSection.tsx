import { X, Check } from "lucide-react";

const antes = [
  "Fechas importantes perdidas en chats.",
  "Tareas anotadas en diferentes aplicaciones.",
  "Mala distribución del trabajo grupal.",
  "Información académica dispersa.",
  "Dificultad para controlar el progreso.",
];

const con = [
  "Entregas organizadas en un calendario.",
  "Actividades agrupadas por curso.",
  "Responsabilidades visibles por integrante.",
  "Recordatorios antes de cada vencimiento.",
  "Progreso académico centralizado.",
];

export default function ProblemSolutionSection() {
  return (
    <section className="bg-white py-16 dark:bg-slate-950/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="text-2xl font-bold text-slate-500 dark:text-slate-500">
              Antes de TaskUni
            </h2>
            <ul className="mt-6 space-y-3">
              {antes.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-slate-500"
                >
                  <X
                    size={18}
                    className="mt-0.5 shrink-0 text-slate-300 dark:text-slate-600"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-brand-50 p-6 dark:bg-brand-950/30">
            <h2 className="text-2xl font-bold text-brand-700 dark:text-brand-400">
              Con TaskUni
            </h2>
            <ul className="mt-6 space-y-3">
              {con.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300"
                >
                  <Check
                    size={18}
                    className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-400"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
