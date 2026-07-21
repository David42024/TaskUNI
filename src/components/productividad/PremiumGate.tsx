import Link from "next/link";
import { Crown, BarChart3, TrendingUp, Layers, Flame } from "lucide-react";

const features = [
  { icon: TrendingUp, label: "Tendencias de cumplimiento" },
  { icon: Layers, label: "Rendimiento por curso" },
  { icon: Flame, label: "Rachas y actividad semanal" },
  { icon: Crown, label: "Reportes históricos" },
];

export default function PremiumGate() {
  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
          <Crown size={14} />
          Función Premium
        </span>
        <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
          Convierte tu actividad en información útil
        </h1>
        <p className="mx-auto mt-2 max-w-md text-slate-500 dark:text-slate-400">
          Accede a tendencias, análisis por curso, rachas y reportes históricos
          con TaskUni Premium.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {features.map((f) => (
          <div
            key={f.label}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/50 p-4 dark:border-white/10 dark:bg-white/[0.03]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <f.icon size={18} />
            </span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {f.label}
            </span>
          </div>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
        <div className="pointer-events-none select-none blur-sm">
          <div className="space-y-3 p-6 opacity-30">
            <div className="h-4 w-3/4 rounded bg-slate-200" />
            <div className="h-4 w-1/2 rounded bg-slate-200" />
            <div className="h-24 rounded bg-slate-100" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-16 rounded bg-slate-100" />
              <div className="h-16 rounded bg-slate-100" />
            </div>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
              Actualiza a Premium para ver tu análisis completo.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/planes"
                className="btn-primary px-6 py-2.5 text-sm"
              >
                Actualizar a Premium
              </Link>
              <Link
                href="/planes"
                className="btn-secondary px-6 py-2.5 text-sm"
              >
                Ver planes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
