"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import clsx from "clsx";
import {
  AlarmClock,
  BookOpen,
  CalendarDays,
  ChevronRight,
  CircleGauge,
  Cloud,
  Crown,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Sparkles,
  Settings,
  Users,
  Bell,
} from "lucide-react";

export type SidebarEstudianteProps = {
  open: boolean;
  onClose: () => void;
  nombre: string;
  planActual: string;
  tareasBadge: number;
  recordatoriosBadge: number;
  proyectosBadge: number;
};

const items = [
  { href: "/dashboard", label: "Inicio / Dashboard", description: "Resumen general del estudiante.", icon: LayoutDashboard },
  { href: "/tareas", label: "Mis tareas", description: "Tareas académicas individuales.", icon: ListChecks },
  { href: "/proyectos", label: "Proyectos grupales", description: "Trabajos colaborativos y equipos.", icon: Users },
  { href: "/calendario", label: "Calendario", description: "Fechas de entrega, reuniones y exámenes.", icon: CalendarDays },
  { href: "/recordatorios", label: "Recordatorios", description: "Alertas de actividades próximas.", icon: Bell },
  { href: "/soporte", label: "Soporte", description: "Consultas y ayuda de la plataforma.", icon: AlarmClock },
  { href: "/productividad", label: "Productividad", description: "Progreso, racha y cumplimiento.", icon: CircleGauge },
  { href: "/cursos", label: "Cursos", description: "Asignaturas o cursos registrados.", icon: BookOpen },
  { href: "/archivos", label: "Archivos", description: "Materiales y recursos académicos.", icon: FileText },
];

function SidebarContent({
  nombre,
  planActual,
  tareasBadge,
  recordatoriosBadge,
  proyectosBadge,
  onClose,
}: Omit<SidebarEstudianteProps, "open">) {
  const pathname = usePathname();

  const badgeMap: Record<string, string | number | null> = {
    "/tareas": tareasBadge,
    "/recordatorios": recordatoriosBadge,
    "/proyectos": proyectosBadge,
    "/soporte": "24/7",
  };

  const isDark = true;
  const isPremium = planActual?.toLowerCase().includes("premium");

  return (
    <div className="flex h-full flex-col bg-white text-slate-800 shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:bg-slate-950 dark:text-slate-100 pt-4">

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {items.map(({ href, label, description, icon: Icon }) => {
            const active = pathname === href;
            const badge = badgeMap[href];

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={clsx(
                  "group flex items-start gap-3 rounded-2xl px-3 py-3 text-sm transition",
                  active
                    ? "bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-100 dark:bg-brand-500/15 dark:text-brand-200 dark:ring-brand-400/20"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                )}
              >
                <span
                  className={clsx(
                    "mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl transition",
                    active
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-700 dark:bg-white/5 dark:text-slate-300 dark:group-hover:bg-brand-500/15 dark:group-hover:text-brand-200"
                  )}
                >
                  <Icon size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{label}</span>
                    {badge !== undefined && badge !== null ? (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-100">
                        {badge}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{description}</span>
                </span>
              </Link>
            );
          })}
        </div>

        <div className="my-5 border-t border-slate-200 dark:border-white/10" />

        <div className="space-y-1">
          <Link
            href="/planes"
            onClick={onClose}
            className={clsx(
              "flex items-center justify-between rounded-2xl px-3 py-3 text-sm transition",
              pathname === "/planes"
                ? "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
            )}
          >
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-300">
                <Crown size={17} />
              </span>
              <span>
                <span className="block font-medium">Plan actual</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">Gratuito o Premium</span>
              </span>
            </span>
          </Link>

        </div>

        {!isPremium && (
          <div className="mt-5 rounded-3xl bg-gradient-to-br from-brand-600 to-violet-600 p-4 text-white shadow-lg shadow-brand-500/20">
            <p className="text-sm font-semibold">Mejora tu organización</p>
            <p className="mt-1 text-xs text-brand-50/90">
              Desbloquea reportes, recordatorios inteligentes y proyectos avanzados.
            </p>
            <Link
              href="/planes"
              onClick={onClose}
              className="mt-4 inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              Actualizar a Premium
            </Link>
          </div>
        )}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-white/10">
        <button
          type="button"
          onClick={() => {
            signOut({ redirect: false }).then(() => {
              window.location.href = "/";
            });
          }}
          className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-200">
              <LogOut size={17} />
            </span>
            Cerrar sesión
          </span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default function SidebarEstudiante(props: SidebarEstudianteProps) {
  const { open, onClose } = props;

  return (
    <>
      <aside className="hidden w-[260px] shrink-0 border-r border-slate-200 bg-white dark:border-white/10 md:block md:h-[calc(100vh-5.5rem)] md:overflow-hidden md:sticky md:top-[5.5rem] dark:bg-slate-950">
        <SidebarContent {...props} onClose={onClose} />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Cerrar sidebar"
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="absolute left-0 top-0 h-full w-[88vw] max-w-[20rem] border-r border-slate-200 bg-white shadow-[20px_0_50px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-slate-950">
            <SidebarContent {...props} onClose={onClose} />
          </aside>
        </div>
      ) : null}
    </>
  );
}