import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
          Empieza a organizar mejor tu semestre
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-slate-600 dark:text-slate-400">
          Centraliza tus tareas, proyectos y entregas desde una sola plataforma
          académica.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/registro" className="btn-primary px-6 py-3 text-base">
            Crear cuenta gratis
          </Link>
          <a href="#planes" className="btn-secondary px-6 py-3 text-base">
            Conocer los planes
          </a>
        </div>
      </div>
    </section>
  );
}
