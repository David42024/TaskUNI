import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pt-20 lg:pb-24">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
            Plataforma académica para universitarios
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 dark:text-white sm:text-5xl">
            Organiza tus tareas, proyectos y entregas en un solo lugar
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Centraliza tu calendario, trabajos grupales y recordatorios para
            cumplir tus entregas sin depender de chats, notas y hojas de cálculo
            dispersas.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/registro"
              className="btn-primary px-6 py-3 text-base"
            >
              Crear cuenta gratis
            </Link>
            <a
              href="#como-funciona"
              className="btn-secondary px-6 py-3 text-base"
            >
              Ver cómo funciona
            </a>
          </div>
          <p className="mt-3 text-sm text-slate-400 dark:text-slate-500">
            Empieza gratis. No requiere tarjeta.
          </p>
        </div>
        <div className="card border-brand-100 bg-brand-50 p-6 dark:border-brand-900 dark:bg-brand-950/40">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
            Vista previa de tu resumen semanal
          </p>
          <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            8 de 12 tareas completadas
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-brand-200 dark:bg-brand-800">
            <div
              className="h-full w-2/3 rounded-full bg-brand-600"
              role="progressbar"
              aria-valuenow={67}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="67 % de cumplimiento"
            />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                3
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Proyectos activos
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                5
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Racha de días
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                67%
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cumplimiento
              </p>
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
            Datos de demostración del producto
          </p>
        </div>
      </div>
    </section>
  );
}
