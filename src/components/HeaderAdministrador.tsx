"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  ChevronDown,
  CreditCard,
  FileText,
  Layers3,
  LifeBuoy,
  Menu,
  MessageSquareMore,
  Search,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import NotificacionesDropdown from "@/components/NotificacionesDropdown";
import type { NotificationItem } from "@/lib/notifications";

export type HeaderAdministradorProps = {
  nombre: string;
  rol: string;
  usuariosActivos: number;
  usuariosPremium: number;
  consultasPendientes: number;
  ingresosEstimados: number;
  notificacionesItems: NotificationItem[];
  onMenuClick: () => void;
};

const accionesRapidas = [
  { href: "/admin/usuarios", label: "Ver usuarios", icon: Users },
  { href: "/admin/reportes", label: "Ver reportes", icon: TrendingUp, principal: true },
  { href: "/admin/soporte", label: "Soporte pendiente", icon: LifeBuoy },
  { href: "/admin/planes", label: "Gestionar planes", icon: Layers3 },
];

function obtenerIniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");
}

export default function HeaderAdministrador({
  nombre,
  rol,
  usuariosActivos,
  usuariosPremium,
  consultasPendientes,
  ingresosEstimados,
  notificacionesItems,
  onMenuClick,
}: HeaderAdministradorProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 text-slate-800 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur supports-[backdrop-filter]:bg-white/90 dark:border-white/10 dark:bg-slate-950/95 dark:text-slate-100 dark:shadow-[0_16px_40px_rgba(0,0,0,0.22)] dark:supports-[backdrop-filter]:bg-slate-950/90">
      <div className="mx-auto w-full px-3 py-3 sm:px-4 lg:px-6">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-indigo-50 px-4 py-3 shadow-[0_14px_40px_rgba(15,23,42,0.06)] sm:px-5 dark:border-white/10 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 dark:shadow-[0_14px_40px_rgba(15,23,42,0.35)]">
          <div className="flex items-center gap-3 lg:gap-4">
            <Link href="/admin" className="flex shrink-0 items-center gap-2.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                <ShieldCheck size={20} />
              </span>
              <span className="leading-tight">
                <span className="block text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                  TaskUni Admin
                </span>
                <span className="hidden text-xs font-medium text-slate-500 sm:block dark:text-slate-300">
                  Panel de control institucional
                </span>
              </span>
            </Link>

            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 lg:flex dark:border-white/10 dark:bg-white/5 dark:text-indigo-100">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              Administrador
            </div>

            <form className="hidden min-w-0 flex-1 lg:block">
              <label className="relative block">
                <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Buscar usuarios, planes, proyectos o consultas..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:bg-white/10 dark:focus:ring-indigo-500/20"
                />
              </label>
            </form>

            <div className="hidden min-w-0 items-center gap-2 xl:flex">
              {accionesRapidas.map(({ href, label, icon: Icon, principal }) => (
                <Link
                  key={label}
                  href={href}
                  className={
                    principal
                      ? "inline-flex h-11 items-center justify-center rounded-2xl bg-indigo-500 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
                      : "inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
                  }
                >
                  <Icon size={16} className="mr-2" />
                  {label}
                </Link>
              ))}
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <ThemeToggle compact />

              <div className="grid grid-cols-4 gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-white/10 dark:bg-white/5">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Activos</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{usuariosActivos}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Premium</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{usuariosPremium}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Soporte</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{consultasPendientes}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400">Ingresos</p>
                  <p className="font-semibold text-slate-900 dark:text-white">S/ {ingresosEstimados.toFixed(0)}</p>
                </div>
              </div>

              <NotificacionesDropdown
                items={notificacionesItems}
                verTodasHref="/admin/reportes"
                emptyLabel="No hay alertas administrativas pendientes."
                storageKey="taskuni-notificaciones-admin"
              />

              <button
                type="button"
                onClick={() => setMenuAbierto((value) => !value)}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-indigo-200 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white">
                  {obtenerIniciales(nombre)}
                </span>
                <span className="hidden min-w-0 lg:block">
                  <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">{nombre}</span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{rol}</span>
                </span>
                <ChevronDown size={16} className="hidden text-slate-400 dark:text-slate-300 xl:block" />
              </button>
            </div>

            <div className="ml-auto flex items-center gap-2 lg:hidden">
              <ThemeToggle compact />

              <NotificacionesDropdown
                items={notificacionesItems}
                verTodasHref="/admin/reportes"
                emptyLabel="No hay alertas administrativas pendientes."
                storageKey="taskuni-notificaciones-admin"
              />

              <button
                type="button"
                onClick={() => setMenuAbierto((value) => !value)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
                aria-label="Abrir perfil del administrador"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white">
                  {obtenerIniciales(nombre)}
                </span>
              </button>

              <button
                type="button"
                onClick={onMenuClick}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
                aria-label="Abrir menú lateral"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          <div className="mt-3 grid gap-3 lg:hidden">
            <label className="relative block">
              <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                placeholder="Buscar usuarios, planes, proyectos o consultas..."
                className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
              />
            </label>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {accionesRapidas.map(({ href, label, icon: Icon, principal }) => (
                <Link
                  key={label}
                  href={href}
                  className={
                    principal
                      ? "inline-flex h-11 items-center justify-center rounded-2xl bg-indigo-500 px-3 text-xs font-semibold text-white"
                      : "inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                  }
                >
                  <Icon size={14} className="mr-2" />
                  {label}
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs sm:hidden">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                <p className="text-slate-500 dark:text-slate-400">Activos</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{usuariosActivos}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                <p className="text-slate-500 dark:text-slate-400">Premium</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{usuariosPremium}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                <p className="text-slate-500 dark:text-slate-400">Consultas</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{consultasPendientes}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                <p className="text-slate-500 dark:text-slate-400">Ingresos</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">S/ {ingresosEstimados.toFixed(0)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-200">Cuenta</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{nombre}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-white/10 dark:text-white">
                <FileText size={18} />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-400">Tema</p>
                <p className="text-sm font-semibold">Claro / oscuro</p>
              </div>
              <ThemeToggle compact />
            </div>
          </div>
        </div>

        {menuAbierto ? (
          <div className="absolute left-3 right-3 top-[calc(100%+0.5rem)] z-50 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-slate-950 sm:left-4 sm:right-4 lg:left-auto lg:right-6 lg:w-[28rem]">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-white/10">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white">
                {obtenerIniciales(nombre)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{nombre}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{rol}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <Link href="/admin/reportes" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5">
                <TrendingUp size={16} className="text-indigo-500" />
                Ver reportes
              </Link>
              <Link href="/admin/usuarios" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5">
                <Users size={16} className="text-indigo-500" />
                Gestión de usuarios
              </Link>
              <Link href="/admin/soporte" className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5">
                <MessageSquareMore size={16} className="text-indigo-500" />
                Soporte pendiente
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
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
