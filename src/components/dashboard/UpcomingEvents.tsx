import Link from "next/link";
import { CalendarClock, FileText, Users, Bell } from "lucide-react";

interface Evento {
  id_evento: string;
  titulo: string;
  tipo_evento: string;
  fecha_inicio: Date;
  fecha_fin: Date | null;
}

interface Props {
  eventos: Evento[];
}

const iconoPorTipo: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  entrega: FileText,
  reunion: Users,
  examen: CalendarClock,
  otro: Bell,
};

const colorPorTipo: Record<string, string> = {
  entrega: "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10",
  reunion: "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10",
  examen: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10",
  otro: "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/10",
};

export default function UpcomingEvents({ eventos }: Props) {
  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
          Próximas fechas
        </h3>
        <Link
          href="/calendario"
          className="text-sm text-brand-600 hover:underline dark:text-brand-400"
        >
          Ver calendario
        </Link>
      </div>
      {eventos.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">
          No tienes eventos próximos registrados.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-white/5">
          {eventos.map((ev) => {
            const Icon = iconoPorTipo[ev.tipo_evento] ?? iconoPorTipo.otro;
            const colorClass = colorPorTipo[ev.tipo_evento] ?? colorPorTipo.otro;
            const diffMs = ev.fecha_inicio.getTime() - Date.now();
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            const esHoy = diffDays <= 0;
            const esManana = diffDays === 1;

            return (
              <li key={ev.id_evento} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colorClass}`}
                >
                  <Icon size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {ev.titulo}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(ev.fecha_inicio).toLocaleDateString("es-PE", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                    {ev.fecha_fin
                      ? ` — ${new Date(ev.fecha_fin).toLocaleTimeString("es-PE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`
                      : ""}
                  </p>
                </div>
                <span
                  className={`shrink-0 self-center text-xs font-medium ${
                    esHoy
                      ? "text-amber-600 dark:text-amber-400"
                      : esManana
                        ? "text-brand-600 dark:text-brand-400"
                        : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {esHoy ? "Hoy" : esManana ? "Mañana" : `${diffDays} días`}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
