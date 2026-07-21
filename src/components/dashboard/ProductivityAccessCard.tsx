import Link from "next/link";
import { TrendingUp, Flame, Target, Zap, BarChart3 } from "lucide-react";

interface Props {
  esPremium: boolean;
  cumplimiento?: number;
  racha?: number;
  reportesSemana?: number[];
}

function MiniSparkline({ datos }: { datos: number[] }) {
  if (datos.length < 2) return null;
  const max = Math.max(...datos, 1);
  const min = Math.min(...datos, 0);
  const rango = max - min || 1;
  const w = 80;
  const h = 28;
  const puntos = datos.map((v, i) => {
    const x = (i / (datos.length - 1)) * w;
    const y = h - ((v - min) / rango) * (h - 4) - 2;
    return `${x},${y}`;
  });
  const d = `M${puntos.join(" L")}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <defs>
        <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b66f5" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#3b66f5" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={`${d} L${w},${h} L0,${h} Z`}
        fill="url(#sparkline-fill)"
      />
      <path
        d={d}
        fill="none"
        stroke="#3b66f5"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={puntos[puntos.length - 1].split(",")[0]}
        cy={puntos[puntos.length - 1].split(",")[1]}
        r={2.5}
        fill="#3b66f5"
      />
    </svg>
  );
}

export default function ProductivityAccessCard({
  esPremium,
  cumplimiento,
  racha,
  reportesSemana,
}: Props) {
  if (esPremium) {
    const tieneDatos = cumplimiento !== undefined && racha !== undefined;
    return (
      <div className="card border-brand-100 bg-brand-50/50 dark:border-brand-800/40 dark:bg-brand-900/20">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
              <TrendingUp size={20} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Resumen de productividad
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Tu rendimiento académico de forma rápida.
              </p>
            </div>
          </div>
          <Link
            href="/productividad"
            className="btn-primary shrink-0 px-5 py-2 text-sm"
          >
            Ver análisis completo
          </Link>
        </div>
        {tieneDatos ? (
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-brand-100 pt-4 dark:border-brand-800/40">
            <div className="flex items-center gap-2">
              <Target size={15} className="text-brand-600 dark:text-brand-400" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cumplimiento
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {cumplimiento}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Flame size={15} className="text-amber-500" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Racha
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {racha} días
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 size={15} className="text-emerald-500" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tendencia
                </p>
                <MiniSparkline datos={reportesSemana ?? []} />
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
            Aún no hay suficiente actividad para mostrar una tendencia.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="card flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400">
          <Zap size={20} />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            Descubre tus hábitos de estudio
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Consulta tendencias, rachas y reportes detallados con el Plan
            Premium.
          </p>
        </div>
      </div>
      <Link
        href="/planes"
        className="btn-primary shrink-0 bg-brand-600 px-5 py-2 text-sm hover:bg-brand-700"
      >
        Conocer Premium
      </Link>
    </div>
  );
}
