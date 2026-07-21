"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  FolderKanban,
  LayoutDashboard,
  Menu,
  PlusCircle,
  Search,
  Sparkles,
  TimerReset,
  NotebookPen,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import NotificacionesDropdown from "@/components/NotificacionesDropdown";
import type { NotificationItem } from "@/lib/notifications";

export type HeaderEstudianteProps = {
  nombre: string;
  carrera: string;
  ciclo: string;
  tareasPendientes: number;
  entregasProximas: number;
  rachaDias: number;
  notificacionesItems: NotificationItem[];
  planActual: string;
  onMenuClick: () => void;
};

const accionesRapidas = [
  { href: "/tareas?nuevo=1", label: "+ Nueva tarea", icon: PlusCircle, principal: true },
  { href: "/proyectos?nuevo=1", label: "Nuevo proyecto", icon: FolderKanban },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/calendario?recordatorios=1", label: "Recordatorios", icon: TimerReset },
];

function obtenerIniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");
}

export default function HeaderEstudiante({
  nombre,
  carrera,
  ciclo,
  tareasPendientes,
  entregasProximas,
  rachaDias,
  notificacionesItems,
  planActual,
  onMenuClick,
}: HeaderEstudianteProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header className="relative sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 dark:border-white/10 dark:bg-slate-950/95 dark:supports-[backdrop-filter]:bg-slate-950/90">
      <div className="mx-auto w-full px-3 py-3 sm:px-4 lg:px-6">
        <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-r from-white via-slate-50 to-brand-50/40 px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.06)] sm:px-5 dark:border-white/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 dark:shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
          <div className="flex items-center gap-3 lg:gap-4">
            <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-white shadow-lg shadow-brand-200">
                <Sparkles size={20} />
              </span>
              <span className="leading-tight">
                <span className="block text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                  TaskUni
                </span>
                <span className="hidden text-xs font-medium text-slate-500 sm:block dark:text-slate-300">
                  Panel académico del estudiante
                </span>
              </span>
            </Link>

            <form className="hidden min-w-0 flex-1 lg:block">
              <label className="relative block">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  placeholder="Buscar tareas, cursos o proyectos..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white/90 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-brand-400 dark:focus:ring-brand-500/20"
                />
              </label>
            </form>

            <div className="hidden min-w-0 items-center gap-2 xl:flex">
              {accionesRapidas.map(({ href, label, icon: Icon, principal }) => (
                <Link
                  key={label}
                  href={href}
                  className={principal ? "btn-primary h-11 px-4" : "btn-secondary h-11 px-4"}
                >
                  <Icon size={16} className="mr-2" />
                  {label}
                </Link>
              ))}
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <ThemeToggle compact />

              <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-white/10 dark:bg-white/5">
                <div>
                  <p className="text-slate-400 dark:text-slate-400">Pendientes</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{tareasPendientes}</p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-400">Próximas</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{entregasProximas}</p>
                </div>
                <div>
                  <p className="text-slate-400 dark:text-slate-400">Racha</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{rachaDias} días</p>
                </div>
              </div>

              <NotificacionesDropdown
                items={notificacionesItems}
                verTodasHref="/recordatorios"
                emptyLabel="No tienes alertas nuevas por ahora."
                storageKey="taskuni-notificaciones-estudiante"
              />

              <button
                type="button"
                onClick={() => setMenuAbierto((value) => !value)}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-brand-200 dark:border-white/10 dark:bg-white/5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-sm font-semibold text-white">
                  {obtenerIniciales(nombre)}
                </span>
                <span className="hidden min-w-0 lg:block text-left">
                  <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{nombre}</span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                    {planActual}
                  </span>
                </span>
                <ChevronDown size={16} className="hidden text-slate-400 dark:text-slate-300 xl:block" />
              </button>
            </div>

            <div className="ml-auto flex items-center gap-2 lg:hidden">
              <ThemeToggle compact />

              <NotificacionesDropdown
                items={notificacionesItems}
                verTodasHref="/recordatorios"
                emptyLabel="No tienes alertas nuevas por ahora."
                storageKey="taskuni-notificaciones-estudiante"
              />

              <button
                type="button"
                onClick={() => setMenuAbierto((value) => !value)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand-200 hover:text-brand-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                aria-label="Abrir perfil del estudiante"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-violet-600 text-xs font-semibold text-white">
                  {obtenerIniciales(nombre)}
                </span>
              </button>

              <button
                type="button"
                onClick={onMenuClick}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand-200 hover:text-brand-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                aria-label="Abrir menú lateral"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          <div className="mt-3 grid gap-3 lg:hidden">
            <label className="relative block">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                placeholder="Buscar tareas, cursos o proyectos..."
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              />
            </label>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {accionesRapidas.map(({ href, label, icon: Icon, principal }) => (
                <Link
                  key={label}
                  href={href}
                  className={principal ? "btn-primary h-11 px-3 text-xs" : "btn-secondary h-11 px-3 text-xs"}
                >
                  <Icon size={14} className="mr-2" />
                  {label}
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs sm:hidden">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-slate-400 dark:text-slate-400">Pendientes</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{tareasPendientes}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-slate-400 dark:text-slate-400">Próximas</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{entregasProximas}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-slate-400 dark:text-slate-400">Racha</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{rachaDias} días</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-900 px-4 py-3 text-white shadow-sm dark:border-white/10">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-brand-200">Plan actual</p>
                <p className="text-sm font-semibold">{planActual}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                <NotebookPen size={18} />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tema</p>
                <p className="text-sm font-semibold">Claro / oscuro</p>
              </div>
              <ThemeToggle compact />
            </div>
          </div>
        </div>

        {menuAbierto ? (
          <div className="absolute left-3 right-3 top-[calc(100%+0.5rem)] z-50 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-slate-950 sm:left-4 sm:right-4 lg:left-auto lg:right-6 lg:w-[28rem]">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-violet-600 text-sm font-semibold text-white">
                {obtenerIniciales(nombre)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{nombre}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {planActual}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <Link href="/dashboard" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5">
                <LayoutDashboard size={16} className="text-brand-600 dark:text-brand-400" />
                Resumen académico
              </Link>
              <Link href="/tareas" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5">
                <BookOpen size={16} className="text-brand-600 dark:text-brand-400" />
                Mis tareas
              </Link>
              <Link href="/proyectos" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5">
                <FolderKanban size={16} className="text-brand-600 dark:text-brand-400" />
                Proyectos grupales
              </Link>
              <Link href="/calendario" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5">
                <CalendarDays size={16} className="text-brand-600 dark:text-brand-400" />
                Calendario y entregas
              </Link>
              <button
                type="button"
                onClick={() => {
                  signOut({ redirect: false }).then(() => {
                    window.location.href = "/";
                  });
                }}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <ChevronDown size={16} className="rotate-90" />
                Cerrar sesión
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}