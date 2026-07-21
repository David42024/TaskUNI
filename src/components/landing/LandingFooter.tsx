import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10 dark:border-white/10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-lg font-bold text-brand-700 dark:text-brand-300"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm text-white">
                T
              </span>
              TaskUni
            </Link>
            <p className="mt-1 max-w-xs text-xs text-slate-500 dark:text-slate-400">
              Plataforma académica digital para estudiantes universitarios.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <a
              href="#funciones"
              className="text-slate-500 transition hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
            >
              Funciones
            </a>
            <a
              href="#planes"
              className="text-slate-500 transition hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
            >
              Planes
            </a>
            <Link
              href="/login"
              className="text-slate-500 transition hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
            >
              Inicio de sesión
            </Link>
            <Link
              href="/soporte"
              className="text-slate-500 transition hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
            >
              Soporte
            </Link>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400 dark:border-white/10 dark:text-slate-500">
          &copy; 2026 TaskUni. Plataforma académica digital para estudiantes
          universitarios.
        </div>
      </div>
    </footer>
  );
}
