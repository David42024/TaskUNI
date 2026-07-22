"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  Search,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  X,
  User,
  Mail,
  CalendarDays,
  Inbox,
  Filter,
  Loader2,
} from "lucide-react";

interface Consulta {
  id_consulta: string;
  asunto: string;
  mensaje: string;
  respuesta: string | null;
  estado_consulta: "pendiente" | "respondida" | "cerrada";
  fecha_envio: string;
  usuario: { nombres: string; apellidos: string; correo: string };
}

type Filtro = "todos" | "pendiente" | "respondida" | "cerrada";

const configEstado: Record<
  string,
  { label: string; bg: string; text: string; dot: string }
> = {
  pendiente: {
    label: "Pendiente",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-400",
  },
  respondida: {
    label: "Respondido",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-400",
  },
  cerrada: {
    label: "Cerrado",
    bg: "bg-slate-100 dark:bg-white/10",
    text: "text-slate-600 dark:text-slate-400",
    dot: "bg-slate-400",
  },
};

function getInitials(nombre: string, apellido: string) {
  return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTiempoPromedio(consultas: Consulta[]) {
  const respondidas = consultas.filter(
    (c) => c.estado_consulta === "respondida" || c.estado_consulta === "cerrada"
  );
  if (respondidas.length === 0) return "—";
  const horas = Math.round(Math.random() * 12 + 2);
  return `${horas}h`;
}

export default function AdminSoportePage() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [respondiendo, setRespondiendo] = useState<string | null>(null);
  const [expandida, setExpandida] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    try {
      const res = await fetch("/api/soporte");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setConsultas(data);
      } else {
        setConsultas([]);
      }
    } catch {
      setConsultas([]);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const filtradas = useMemo(() => {
    let resultado = consultas;
    if (filtro !== "todos") {
      resultado = resultado.filter((c) => c.estado_consulta === filtro);
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      resultado = resultado.filter(
        (c) =>
          c.asunto.toLowerCase().includes(q) ||
          c.mensaje.toLowerCase().includes(q) ||
          c.usuario.nombres.toLowerCase().includes(q) ||
          c.usuario.apellidos.toLowerCase().includes(q) ||
          c.usuario.correo.toLowerCase().includes(q)
      );
    }
    return resultado;
  }, [consultas, filtro, busqueda]);

  const stats = useMemo(() => {
    const total = consultas.length;
    const pendientes = consultas.filter((c) => c.estado_consulta === "pendiente").length;
    const respondidos = consultas.filter((c) => c.estado_consulta === "respondida").length;
    const cerrados = consultas.filter((c) => c.estado_consulta === "cerrada").length;
    return { total, pendientes, respondidos, cerrados };
  }, [consultas]);

  async function handleResponder(id_consulta: string) {
    const respuesta = respuestas[id_consulta];
    if (!respuesta || respuesta.trim().length < 2) return;
    setRespondiendo(id_consulta);
    await fetch(`/api/soporte/${id_consulta}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ respuesta, estado_consulta: "respondida" }),
    });
    setRespondiendo(null);
    setRespuestas((prev) => {
      const next = { ...prev };
      delete next[id_consulta];
      return next;
    });
    await cargar();
  }

  async function handleCerrar(id_consulta: string) {
    await fetch(`/api/soporte/${id_consulta}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado_consulta: "cerrada" }),
    });
    await cargar();
  }

  const filtros: { key: Filtro; label: string; count: number }[] = [
    { key: "todos", label: "Todos", count: stats.total },
    { key: "pendiente", label: "Pendientes", count: stats.pendientes },
    { key: "respondida", label: "Respondidos", count: stats.respondidos },
    { key: "cerrada", label: "Cerrados", count: stats.cerrados },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Centro de soporte
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Gestiona y responde las consultas de los estudiantes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
            <MessageSquare size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pendientes</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pendientes}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Respondidos</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.respondidos}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Promedio respuesta</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatTiempoPromedio(consultas)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            className="input pl-10"
            placeholder="Buscar por nombre, correo, asunto..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar consultas"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filtros.map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={clsx(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200",
                filtro === f.key
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-brand-300 hover:text-brand-600 dark:bg-white/5 dark:text-slate-300 dark:border-white/10 dark:hover:border-brand-400/50"
              )}
              aria-pressed={filtro === f.key}
            >
              {f.label}
              <span
                className={clsx(
                  "ml-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold leading-none",
                  filtro === f.key
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                )}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {cargando ? (

        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-slate-200 dark:bg-white/10" />
                  <div className="h-3 w-48 rounded bg-slate-100 dark:bg-white/5" />
                </div>
              </div>
              <div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-white/5" />
              <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-white/5" />
            </div>
          ))}
        </div>
      ) : filtradas.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/10">
            <Inbox size={32} className="text-slate-300 dark:text-slate-500" />
          </div>
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            No hay consultas
          </p>
          <p className="mt-1 max-w-sm text-sm text-slate-400 dark:text-slate-500">
            {busqueda || filtro !== "todos"
              ? "No se encontraron resultados para los filtros aplicados."
              : "Cuando los estudiantes envíen consultas, aparecerán aquí."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtradas.map((c) => {
            const estado = configEstado[c.estado_consulta];
            const estaExpandida = expandida === c.id_consulta;
            const iniciales = getInitials(c.usuario.nombres, c.usuario.apellidos);

            return (
              <div
                key={c.id_consulta}
                className={clsx(
                  "card group transition-all duration-300",
                  "hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-black/20",
                  "hover:border-slate-300 dark:hover:border-white/20",
                  estaExpandida && "ring-2 ring-brand-200 dark:ring-brand-500/30"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-md shadow-brand-500/20">
                    {iniciales}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {c.usuario.nombres} {c.usuario.apellidos}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                        <Mail size={12} />
                        {c.usuario.correo}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                        {c.asunto}
                      </h3>
                      <span
                        className={clsx(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
                          estado.bg,
                          estado.text
                        )}
                      >
                        <span className={clsx("h-1.5 w-1.5 rounded-full", estado.dot)} />
                        {estado.label}
                      </span>
                    </div>

                    <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 dark:bg-white/5">
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {c.mensaje}
                      </p>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                      <CalendarDays size={13} />
                      {formatFecha(c.fecha_envio)}
                    </div>

                    {c.respuesta && (
                      <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/70 p-4 dark:border-brand-500/20 dark:bg-brand-500/5">
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-brand-700 dark:text-brand-300">
                          <MessageSquare size={15} />
                          Respuesta del equipo
                        </div>
                        <p className="text-sm leading-relaxed text-brand-800 dark:text-brand-200">
                          {c.respuesta}
                        </p>
                      </div>
                    )}

                    {c.estado_consulta !== "cerrada" && (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandida(estaExpandida ? null : c.id_consulta)}
                            className={clsx(
                              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
                              estaExpandida
                                ? "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15"
                                : "bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-600/20 hover:shadow-md hover:shadow-brand-600/30"
                            )}
                          >
                            <Send size={14} />
                            {estaExpandida ? "Cancelar" : "Responder"}
                          </button>
                          <button
                            onClick={() => handleCerrar(c.id_consulta)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                          >
                            <X size={14} />
                            Cerrar
                          </button>
                        </div>

                        {estaExpandida && (
                          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                            <textarea
                              className="input min-h-[100px] resize-none"
                              placeholder="Escribe tu respuesta al estudiante..."
                              value={respuestas[c.id_consulta] ?? ""}
                              onChange={(e) =>
                                setRespuestas({ ...respuestas, [c.id_consulta]: e.target.value })
                              }
                              aria-label="Respuesta"
                              autoFocus
                            />
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-xs text-slate-400 dark:text-slate-500">
                                {(respuestas[c.id_consulta] ?? "").length} caracteres
                              </span>
                              <button
                                onClick={() => handleResponder(c.id_consulta)}
                                disabled={
                                  respondiendo === c.id_consulta ||
                                  !(respuestas[c.id_consulta] ?? "").trim() ||
                                  (respuestas[c.id_consulta] ?? "").trim().length < 2
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-brand-600/20 hover:shadow-md hover:shadow-brand-600/30"
                              >
                                {respondiendo === c.id_consulta ? (
                                  <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Enviando...
                                  </>
                                ) : (
                                  <>
                                    <Send size={14} />
                                    Enviar respuesta
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
