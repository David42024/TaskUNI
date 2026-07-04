"use client";

import Link from "next/link";
import clsx from "clsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCheck, CircleDot, Clock3, ExternalLink } from "lucide-react";
import type { NotificationItem } from "@/lib/notifications";

type Props = {
  items: NotificationItem[];
  verTodasHref: string;
  emptyLabel: string;
  storageKey: string;
};

const badgeStyles: Record<NotificationItem["estado"], string> = {
  pendiente: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
  alerta: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200",
  info: "bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100",
  exito: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
};

export default function NotificacionesDropdown({ items, verTodasHref, emptyLabel, storageKey }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [leidas, setLeidas] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setLeidas(parsed.filter((value) => typeof value === "string"));
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) {
        setAbierto(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(leidas));
  }, [leidas, storageKey]);

  const visibles = useMemo(() => items.filter((item) => !leidas.includes(item.id)), [items, leidas]);

  const marcarTodasComoLeidas = () => {
    setLeidas(items.map((item) => item.id));
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((value) => !value)}
        aria-label={`Notificaciones ${visibles.length}`}
        aria-expanded={abierto}
        title="Notificaciones"
        className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-brand-200 hover:text-brand-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-brand-400/40 dark:hover:text-brand-300"
      >
        <Bell size={18} />
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-semibold text-white dark:bg-violet-500">
          {visibles.length}
        </span>
      </button>

      {abierto ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(92vw,24rem)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.15)] dark:border-white/10 dark:bg-slate-950 dark:shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Notificaciones</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{visibles.length} pendientes</p>
            </div>
            <button
              type="button"
              onClick={marcarTodasComoLeidas}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              <CheckCheck size={14} />
              Marcar como leídas
            </button>
          </div>

          <div className="max-h-[28rem] overflow-y-auto p-2">
            {visibles.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
                <CircleDot className="text-brand-500 dark:text-brand-300" size={28} />
                <p className="text-sm font-medium text-slate-900 dark:text-white">Sin notificaciones</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{emptyLabel}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {visibles.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setAbierto(false)}
                    className="block rounded-2xl border border-slate-200 p-3 transition hover:border-brand-200 hover:bg-slate-50 dark:border-white/10 dark:hover:border-brand-400/30 dark:hover:bg-white/5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.titulo}</p>
                          <span className={clsx("badge", badgeStyles[item.estado])}>{item.estado}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.descripcion}</p>
                      </div>
                      <ExternalLink size={14} className="mt-1 shrink-0 text-slate-400" />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                      <span>{item.tipo}</span>
                      <span className="inline-flex items-center gap-1"><Clock3 size={12} />{item.fechaLabel}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 p-3 dark:border-white/10">
            <Link
              href={verTodasHref}
              onClick={() => setAbierto(false)}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Ver todas
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
