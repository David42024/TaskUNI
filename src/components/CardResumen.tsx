import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface Props {
  titulo: string;
  valor: string | number;
  icon: LucideIcon;
  color?: "brand" | "green" | "amber" | "red" | "slate";
  subtitulo?: string;
}

const colores = {
  brand: "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100",
  green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-100",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-100",
  red: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-100",
  slate: "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-100",
};

export default function CardResumen({ titulo, valor, icon: Icon, color = "brand", subtitulo }: Props) {
  return (
    <div className="card flex items-center gap-4">
      <div className={clsx("flex h-12 w-12 items-center justify-center rounded-xl", colores[color])}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{titulo}</p>
        <p className="text-2xl font-semibold text-slate-900 dark:text-white">{valor}</p>
        {subtitulo && <p className="text-xs text-slate-400 dark:text-slate-500">{subtitulo}</p>}
      </div>
    </div>
  );
}
