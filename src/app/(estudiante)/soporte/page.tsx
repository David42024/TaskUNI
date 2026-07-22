"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import {
  LifeBuoy,
  MessageSquare,
  CircleAlert,
  CheckCircle2,
  Send,
  ChevronRight,
  Clock,
  Inbox,
  Loader2,
  Check,
  User,
  Shield,
} from "lucide-react";

interface Consulta {
  id_consulta: string;
  asunto: string;
  mensaje: string;
  respuesta: string | null;
  estado_consulta: "pendiente" | "respondida" | "cerrada";
  fecha_envio: string;
}

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

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-PE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatHora(fecha: string) {
  return new Date(fecha).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SoportePage() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    const res = await fetch("/api/soporte");
    setConsultas(await res.json());
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setExito(false);
    if (asunto.trim().length < 2 || mensaje.trim().length < 5) {
      setError("Completa el asunto (mín. 2 caracteres) y el mensaje (mín. 5 caracteres).");
      return;
    }
    setEnviando(true);
    const res = await fetch("/api/soporte", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asunto, mensaje }),
    });
    setEnviando(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "No se pudo enviar la consulta");
      return;
    }
    setAsunto("");
    setMensaje("");
    setExito(true);
    await cargar();
  }

  const consultasConRespuesta = consultas.filter((c) => c.respuesta);
  const consultasSeleccionada = consultas.find((c) => c.id_consulta === seleccionada);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Centro de soporte</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Envía tus consultas y revisa las respuestas del equipo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
            <MessageSquare size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Consultas</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{consultas.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
            <CircleAlert size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pendientes</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {consultas.filter((c) => c.estado_consulta === "pendiente").length}
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Respondidos</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {consultas.filter((c) => c.estado_consulta === "respondida").length}
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300">
            <LifeBuoy size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Canal activo</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">24/7</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="order-2 lg:order-1 lg:col-span-3 space-y-4">
          <div className="card p-0 overflow-hidden">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
              <h2 className="text-base font-semibold text-slate-800 dark:text-white">
                Historial de consultas
              </h2>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              {cargando ? (
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="h-4 w-40 rounded bg-slate-200 dark:bg-white/10" />
                        <div className="h-5 w-16 rounded-full bg-slate-100 dark:bg-white/5" />
                      </div>
                      <div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-white/5" />
                      <div className="h-3 w-20 rounded bg-slate-100 dark:bg-white/5" />
                    </div>
                  ))}
                </div>
              ) : consultas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/10">
                    <Inbox size={32} className="text-slate-300 dark:text-slate-500" />
                  </div>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">
                    Sin consultas aún
                  </p>
                  <p className="mt-1 max-w-xs text-sm text-slate-400 dark:text-slate-500">
                    Envía tu primera consulta usando el formulario y las verás aquí.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {consultas.map((c) => {
                    const estado = configEstado[c.estado_consulta];
                    const estaSeleccionada = seleccionada === c.id_consulta;

                    return (
                      <button
                        key={c.id_consulta}
                        onClick={() => setSeleccionada(estaSeleccionada ? null : c.id_consulta)}
                        className={clsx(
                          "w-full px-5 py-4 text-left transition-all duration-200 hover:bg-slate-50 dark:hover:bg-white/5",
                          estaSeleccionada && "bg-brand-50/50 dark:bg-brand-500/5"
                        )}
                        aria-expanded={estaSeleccionada}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-medium text-slate-800 dark:text-white">
                                {c.asunto}
                              </p>
                              <span
                                className={clsx(
                                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0",
                                  estado.bg,
                                  estado.text
                                )}
                              >
                                <span className={clsx("h-1.5 w-1.5 rounded-full", estado.dot)} />
                                {estado.label}
                              </span>
                            </div>
                            <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                              {c.mensaje}
                            </p>
                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                              {formatFecha(c.fecha_envio)} &middot; {formatHora(c.fecha_envio)}
                            </p>
                          </div>
                          <ChevronRight
                            size={16}
                            className={clsx(
                              "ml-2 flex-shrink-0 text-slate-300 transition-transform duration-200 dark:text-slate-600",
                              estaSeleccionada && "rotate-90 text-brand-500 dark:text-brand-400"
                            )}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {consultasSeleccionada && (
            <div className="card animate-in fade-in slide-in-from-bottom-2 duration-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-slate-800 dark:text-white">
                  {consultasSeleccionada.asunto}
                </h3>
                <span
                  className={clsx(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                    configEstado[consultasSeleccionada.estado_consulta].bg,
                    configEstado[consultasSeleccionada.estado_consulta].text
                  )}
                >
                  <span
                    className={clsx(
                      "h-1.5 w-1.5 rounded-full",
                      configEstado[consultasSeleccionada.estado_consulta].dot
                    )}
                  />
                  {configEstado[consultasSeleccionada.estado_consulta].label}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                    <User size={14} />
                  </div>
                  <div className="flex-1 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 dark:bg-white/10">
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                      {consultasSeleccionada.mensaje}
                    </p>
                    <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                      {formatFecha(consultasSeleccionada.fecha_envio)} &middot;{" "}
                      {formatHora(consultasSeleccionada.fecha_envio)}
                    </p>
                  </div>
                </div>

                {consultasSeleccionada.respuesta && (
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                      <Shield size={14} />
                    </div>
                    <div className="flex-1 rounded-2xl rounded-tl-sm bg-brand-50 px-4 py-3 dark:bg-brand-500/10">
                      <p className="text-xs font-medium text-brand-600 dark:text-brand-400">
                        Equipo de soporte
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-brand-800 dark:text-brand-200">
                        {consultasSeleccionada.respuesta}
                      </p>
                    </div>
                  </div>
                )}

                {consultasSeleccionada.estado_consulta === "pendiente" && (
                  <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    <Clock size={15} />
                    Esperando respuesta del equipo de soporte...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="order-1 lg:order-2 lg:col-span-2">
          <div className="card sticky top-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                <Send size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white">Nueva consulta</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">Respuesta en menos de 24h</p>
              </div>
            </div>

            <form onSubmit={handleEnviar} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
                  {error}
                </div>
              )}

              {exito && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  <Check size={16} />
                  Consulta enviada correctamente.
                </div>
              )}

              <div>
                <label className="label" htmlFor="soporte-asunto">
                  Asunto
                </label>
                <input
                  id="soporte-asunto"
                  className="input"
                  placeholder="Ej: Problema con entrega de tarea"
                  value={asunto}
                  onChange={(e) => {
                    setAsunto(e.target.value);
                    setExito(false);
                  }}
                  maxLength={150}
                />
              </div>

              <div>
                <label className="label" htmlFor="soporte-mensaje">
                  Mensaje
                </label>
                <textarea
                  id="soporte-mensaje"
                  rows={6}
                  className="input resize-none"
                  placeholder="Describe tu problema o duda con el mayor detalle posible..."
                  value={mensaje}
                  onChange={(e) => {
                    setMensaje(e.target.value);
                    setExito(false);
                  }}
                  maxLength={2000}
                />
                <div className="mt-1 flex items-center justify-end">
                  <span
                    className={clsx(
                      "text-xs",
                      mensaje.length > 1800
                        ? "text-red-500"
                        : "text-slate-400 dark:text-slate-500"
                    )}
                  >
                    {mensaje.length} / 2000
                  </span>
                </div>
              </div>

              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-brand-600/20 hover:shadow-md hover:shadow-brand-600/30"
                disabled={enviando}
              >
                {enviando ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Enviar consulta
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
