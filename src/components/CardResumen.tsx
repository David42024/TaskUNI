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
    <div className="card flex flex-col justify-between p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-500/5 dark:hover:shadow-brand-400/5 relative overflow-hidden group">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-transparent to-black/5 dark:to-white/5 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
      <div className="flex items-center gap-4 relative z-10">
        <div className={clsx("flex h-12 w-12 items-center justify-center rounded-xl shadow-sm", colores[color])}>
          <Icon size={22} className="transition-transform duration-300 group-hover:scale-110" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{titulo}</p>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{valor}</p>
          {subtitulo && <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">{subtitulo}</p>}
        </div>
      </div>
    </div>
  );
}
