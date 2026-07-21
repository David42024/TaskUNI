"use client";

import { CalendarDays } from "lucide-react";

const opciones = [
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
  { value: "ciclo", label: "Este ciclo" },
];

export default function ProductivityFilters() {
  return (
    <div className="flex items-center gap-2">
      <CalendarDays size={16} className="text-slate-400" />
      <select
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-white/10 dark:bg-slate-950 dark:text-slate-300 dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
        defaultValue="30d"
        aria-label="Seleccionar periodo"
      >
        {opciones.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
