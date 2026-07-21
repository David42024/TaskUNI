import Link from "next/link";
import { Check } from "lucide-react";

const planes = [
  {
    nombre: "Plan Gratuito",
    precio: "S/ 0",
    descripcion:
      "Ideal para comenzar a organizar tu vida universitaria.",
    beneficios: [
      "Registro de cuenta",
      "Gestión básica de tareas",
      "Calendario académico",
      "Recordatorios básicos",
      "Proyectos grupales limitados",
    ],
    destacado: false,
    etiqueta: null,
    boton: "Crear cuenta gratis",
  },
  {
    nombre: "Plan Premium",
    precio: "S/ 19.90 al mes",
    descripcion:
      "Funciones avanzadas para estudiantes y equipos que necesitan mayor control.",
    beneficios: [
      "Tareas ilimitadas",
      "Tableros Kanban avanzados",
      "Reportes de productividad",
      "Recordatorios inteligentes",
      "Mayor almacenamiento",
      "Analítica de rendimiento",
    ],
    destacado: true,
    etiqueta: "Recomendado",
    boton: "Elegir Premium",
  },
];

export default function PricingSection() {
  return (
    <section id="planes" className="scroll-mt-20 py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">
          Planes
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-600 dark:text-slate-400">
          Empieza gratis y actualiza cuando necesites más funciones.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {planes.map((p) => (
            <div
              key={p.nombre}
              className={
                p.destacado
                  ? "card border-brand-200 bg-gradient-to-br from-brand-600 to-brand-800 shadow-md dark:border-brand-700"
                  : "card"
              }
            >
              {p.etiqueta && (
                <span className="badge mb-3 bg-white/20 text-xs text-white">
                  {p.etiqueta}
                </span>
              )}
              <h3
                className={
                  p.destacado
                    ? "text-xl font-bold text-white"
                    : "text-xl font-bold text-slate-900 dark:text-white"
                }
              >
                {p.nombre}
              </h3>
              <p
                className={
                  p.destacado
                    ? "mt-1 text-sm text-brand-100"
                    : "mt-1 text-sm text-slate-500 dark:text-slate-400"
                }
              >
                {p.descripcion}
              </p>
              <p
                className={
                  p.destacado
                    ? "mt-4 text-3xl font-bold text-white"
                    : "mt-4 text-3xl font-bold text-slate-900 dark:text-white"
                }
              >
                {p.precio}
              </p>
              <ul className="mt-6 space-y-2">
                {p.beneficios.map((b) => (
                  <li
                    key={b}
                    className={
                      "flex items-center gap-2 text-sm " +
                      (p.destacado
                        ? "text-brand-50"
                        : "text-slate-600 dark:text-slate-300")
                    }
                  >
                    <Check
                      size={16}
                      className={
                        p.destacado
                          ? "text-white"
                          : "text-brand-600 dark:text-brand-400"
                      }
                      aria-hidden
                    />
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                href="/registro"
                className={
                  p.destacado
                    ? "btn-secondary mt-6 w-full border-white/30 bg-white text-brand-700 hover:bg-brand-50"
                    : "btn-primary mt-6 w-full"
                }
              >
                {p.boton}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
