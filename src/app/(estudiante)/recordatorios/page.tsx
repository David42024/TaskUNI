"use client";

import { useEffect, useState } from "react";
import CardResumen from "@/components/CardResumen";
import { Bell, CheckCircle2, Clock3, Trash2, Plus, X, Calendar, BookOpen, Layers } from "lucide-react";
import clsx from "clsx";

interface RelationItem {
  id: string;
  titulo: string;
  tipo: "tarea" | "proyecto" | "evento";
}

interface Recordatorio {
  id_recordatorio: string;
  titulo: string;
  descripcion: string | null;
  fecha_recordatorio: string;
  tipo_recordatorio: string;
  estado: string;
  id_tarea: string | null;
  id_proyecto: string | null;
  id_evento: string | null;
  tarea?: { titulo: string } | null;
  proyecto?: { nombre_proyecto: string } | null;
  evento?: { titulo: string } | null;
}

const colorEstado: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  enviado: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  descartado: "bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400",
};

export default function RecordatoriosPage() {
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
  const [cargando, setCargando] = useState(true);

  // Lists for linking new reminders
  const [tareas, setTareas] = useState<{ id_tarea: string; titulo: string }[]>([]);
  const [proyectos, setProyectos] = useState<{ id_proyecto: string; nombre_proyecto: string }[]>([]);
  const [eventos, setEventos] = useState<{ id_evento: string; titulo: string; tipo_evento: string }[]>([]);

  // Modal States
  const [modalAbierto, setModalAbierto] = useState(false);
  const [errorModal, setErrorModal] = useState("");
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevaDesc, setNuevaDesc] = useState("");
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState("basico");
  
  // Relations selection helper
  const [relacionTipo, setRelacionTipo] = useState(""); // "tarea", "proyecto", "evento", or ""
  const [relacionId, setRelacionId] = useState("");

  async function cargarDatos() {
    setCargando(true);
    try {
      const res = await fetch("/api/recordatorios");
      const data = await res.json();
      setRecordatorios(data);

      // Load relations in background
      const [resTareas, resProyectos, resEventos] = await Promise.all([
        fetch("/api/tareas").then((r) => r.json()),
        fetch("/api/proyectos").then((r) => r.json()),
        fetch("/api/eventos").then((r) => r.json()),
      ]);
      setTareas(resTareas || []);
      setProyectos(resProyectos || []);
      setEventos((resEventos || []).filter((e: any) => !e.isReadOnly)); // Only custom events can have reminders
    } catch (err) {}
    setCargando(false);
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- OPTIMISTIC UI OPERATIONS ---

  async function handleCambiarEstado(id: string, nuevoEstado: string) {
    const prevRecordatorios = [...recordatorios];

    // Optimistic update
    const nuevosRecordatorios = recordatorios.map((r) => {
      if (r.id_recordatorio === id) {
        return { ...r, estado: nuevoEstado };
      }
      return r;
    });
    setRecordatorios(nuevosRecordatorios);

    try {
      const res = await fetch(`/api/recordatorios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error();
      // Silent sync
      const resData = await fetch("/api/recordatorios");
      const data = await resData.json();
      setRecordatorios(data);
    } catch (err) {
      setRecordatorios(prevRecordatorios);
      alert("Error al actualizar el recordatorio. Se ha revertido el cambio.");
    }
  }

  async function handleEliminar(id: string) {
    const prevRecordatorios = [...recordatorios];

    // Optimistic update
    const nuevosRecordatorios = recordatorios.filter((r) => r.id_recordatorio !== id);
    setRecordatorios(nuevosRecordatorios);

    try {
      const res = await fetch(`/api/recordatorios/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      // Silent sync
      const resData = await fetch("/api/recordatorios");
      const data = await resData.json();
      setRecordatorios(data);
    } catch (err) {
      setRecordatorios(prevRecordatorios);
      alert("Error al eliminar el recordatorio. Se ha revertido el cambio.");
    }
  }

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setErrorModal("");

    if (!nuevoTitulo || !nuevaFecha) {
      setErrorModal("El título y la fecha son obligatorios");
      return;
    }

    const prevRecordatorios = [...recordatorios];

    // Build temp recordatorio to show instantly
    let relationLabel = "";
    let relObj: any = {};
    if (relacionTipo === "tarea" && relacionId) {
      const t = tareas.find((x) => x.id_tarea === relacionId);
      if (t) {
        relationLabel = `Tarea: ${t.titulo}`;
        relObj.tarea = { titulo: t.titulo };
      }
    } else if (relacionTipo === "proyecto" && relacionId) {
      const p = proyectos.find((x) => x.id_proyecto === relacionId);
      if (p) {
        relationLabel = `Proyecto: ${p.nombre_proyecto}`;
        relObj.proyecto = { nombre_proyecto: p.nombre_proyecto };
      }
    } else if (relacionTipo === "evento" && relacionId) {
      const ev = eventos.find((x) => x.id_evento === relacionId);
      if (ev) {
        relationLabel = `Evento: ${ev.titulo}`;
        relObj.evento = { titulo: ev.titulo };
      }
    }

    const tempId = `temp-${Date.now()}`;
    const tempReminder: Recordatorio = {
      id_recordatorio: tempId,
      titulo: nuevoTitulo,
      descripcion: nuevaDesc || null,
      fecha_recordatorio: new Date(nuevaFecha).toISOString(),
      tipo_recordatorio: nuevoTipo,
      estado: "pendiente",
      id_tarea: relacionTipo === "tarea" ? relacionId : null,
      id_proyecto: relacionTipo === "proyecto" ? relacionId : null,
      id_evento: relacionTipo === "evento" ? relacionId : null,
      ...relObj,
    };

    setRecordatorios([...recordatorios, tempReminder].sort((a, b) => new Date(a.fecha_recordatorio).getTime() - new Date(b.fecha_recordatorio).getTime()));
    setModalAbierto(false);

    // Save values before reset
    const pTitulo = nuevoTitulo;
    const pDesc = nuevaDesc;
    const pFecha = nuevaFecha;
    const pTipo = nuevoTipo;
    const pRelTipo = relacionTipo;
    const pRelId = relacionId;

    // Reset modal fields
    setNuevoTitulo("");
    setNuevaDesc("");
    setNuevaFecha("");
    setNuevoTipo("basico");
    setRelacionTipo("");
    setRelacionId("");

    try {
      const res = await fetch("/api/recordatorios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: pTitulo,
          descripcion: pDesc || null,
          fecha_recordatorio: pFecha,
          tipo_recordatorio: pTipo,
          id_tarea: pRelTipo === "tarea" ? pRelId : null,
          id_proyecto: pRelTipo === "proyecto" ? pRelId : null,
          id_evento: pRelTipo === "evento" ? pRelId : null,
        }),
      });
      if (!res.ok) throw new Error();
      // Sync
      const resData = await fetch("/api/recordatorios");
      const data = await resData.json();
      setRecordatorios(data);
    } catch (err) {
      setRecordatorios(prevRecordatorios);
      alert("Error al crear el recordatorio. Se ha revertido el cambio.");
    }
  }

  // --- RENDERING HELPERS & GROUPING ---

  const now = new Date();

  const vencidos = recordatorios
    .filter((r) => r.estado === "pendiente" && new Date(r.fecha_recordatorio) < now)
    .sort((a, b) => new Date(a.fecha_recordatorio).getTime() - new Date(b.fecha_recordatorio).getTime());

  const proximos = recordatorios
    .filter((r) => r.estado === "pendiente" && new Date(r.fecha_recordatorio) >= now)
    .sort((a, b) => new Date(a.fecha_recordatorio).getTime() - new Date(b.fecha_recordatorio).getTime());

  const historial = recordatorios
    .filter((r) => r.estado !== "pendiente")
    .sort((a, b) => new Date(b.fecha_recordatorio).getTime() - new Date(a.fecha_recordatorio).getTime()); // Latest read first

  const countPendientes = recordatorios.filter((r) => r.estado === "pendiente").length;
  const countEnviados = recordatorios.filter((r) => r.estado === "enviado").length;
  const countDescartados = recordatorios.filter((r) => r.estado === "descartado").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Recordatorios</h1>
          <p className="text-slate-500 dark:text-slate-400">Alertas pendientes, enviadas y descartadas en tiempo real.</p>
        </div>
        <button onClick={() => setModalAbierto(true)} className="btn-primary flex items-center gap-1.5">
          <Plus size={16} /> Nuevo recordatorio
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <CardResumen titulo="Pendientes" valor={countPendientes} icon={Clock3} color="amber" />
        <CardResumen titulo="Enviados / Leídos" valor={countEnviados} icon={CheckCircle2} color="green" />
        <CardResumen titulo="Descartados" valor={countDescartados} icon={Trash2} color="slate" />
      </div>

      {cargando ? (
        <div className="card text-center text-slate-400">Cargando recordatorios...</div>
      ) : (
        <div className="space-y-6">
          {/* Overdue Section */}
          {vencidos.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Vencidos
              </h2>
              <div className="grid gap-3">
                {vencidos.map((r) => (
                  <RecordatorioCard key={r.id_recordatorio} r={r} onCambiarEstado={handleCambiarEstado} onEliminar={handleEliminar} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Section */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Próximos</h2>
            {proximos.length === 0 && vencidos.length === 0 ? (
              <div className="card text-center text-slate-400 py-6">No tienes recordatorios pendientes.</div>
            ) : (
              <div className="grid gap-3">
                {proximos.map((r) => (
                  <RecordatorioCard key={r.id_recordatorio} r={r} onCambiarEstado={handleCambiarEstado} onEliminar={handleEliminar} />
                ))}
              </div>
            )}
          </div>

          {/* History Section */}
          {historial.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-500 dark:text-slate-400">Historial</h2>
              <div className="grid gap-3 opacity-75">
                {historial.map((r) => (
                  <RecordatorioCard key={r.id_recordatorio} r={r} onCambiarEstado={handleCambiarEstado} onEliminar={handleEliminar} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Creation Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-white/10">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Nuevo recordatorio</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCrear} className="space-y-4">
              {errorModal && <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-200">{errorModal}</div>}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Título</label>
                <input
                  className="input"
                  placeholder="Recordar estudiar álgebra..."
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Descripción</label>
                <textarea
                  className="input min-h-[60px]"
                  placeholder="Agregar detalles adicionales..."
                  value={nuevaDesc}
                  onChange={(e) => setNuevaDesc(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Fecha y Hora</label>
                  <input
                    type="datetime-local"
                    className="input text-xs"
                    value={nuevaFecha}
                    onChange={(e) => setNuevaFecha(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Tipo de Alerta</label>
                  <select
                    className="input text-xs"
                    value={nuevoTipo}
                    onChange={(e) => setNuevoTipo(e.target.value)}
                  >
                    <option value="basico">Básico</option>
                    <option value="inteligente">Inteligente</option>
                  </select>
                </div>
              </div>

              {/* Relation Selector */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Vincular a</label>
                  <select
                    className="input text-xs"
                    value={relacionTipo}
                    onChange={(e) => {
                      setRelacionTipo(e.target.value);
                      setRelacionId("");
                    }}
                  >
                    <option value="">Ninguno (General)</option>
                    <option value="tarea">Una Tarea</option>
                    <option value="proyecto">Un Proyecto</option>
                    <option value="evento">Un Evento</option>
                  </select>
                </div>
                {relacionTipo && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Seleccionar elemento</label>
                    <select
                      className="input text-xs"
                      value={relacionId}
                      onChange={(e) => setRelacionId(e.target.value)}
                      required
                    >
                      <option value="">Selecciona...</option>
                      {relacionTipo === "tarea" &&
                        tareas.map((t) => (
                          <option key={t.id_tarea} value={t.id_tarea}>
                            {t.titulo}
                          </option>
                        ))}
                      {relacionTipo === "proyecto" &&
                        proyectos.map((p) => (
                          <option key={p.id_proyecto} value={p.id_proyecto}>
                            {p.nombre_proyecto}
                          </option>
                        ))}
                      {relacionTipo === "evento" &&
                        eventos.map((ev) => (
                          <option key={ev.id_evento} value={ev.id_evento}>
                            {ev.titulo}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-secondary text-xs" onClick={() => setModalAbierto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Crear recordatorio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function RecordatorioCard({
  r,
  onCambiarEstado,
  onEliminar,
}: {
  r: Recordatorio;
  onCambiarEstado: (id: string, state: string) => void;
  onEliminar: (id: string) => void;
}) {
  const isTemp = r.id_recordatorio.startsWith("temp-");
  
  // Format DateTime beautifully
  const dateFormatted = new Date(r.fecha_recordatorio).toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div
      className={clsx(
        "card flex flex-wrap items-start justify-between gap-4 p-4 border transition",
        isTemp ? "opacity-60 bg-slate-50/50" : "hover:shadow-sm"
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm">{r.titulo}</h3>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${colorEstado[r.estado]}`}>
            {r.estado}
          </span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
            🔔 {r.tipo_recordatorio}
          </span>
        </div>
        
        {r.descripcion && <p className="text-xs text-slate-500 dark:text-slate-400">{r.descripcion}</p>}
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 dark:text-slate-500 mt-2">
          <span>📅 {dateFormatted}</span>
          
          {/* Relation Tags */}
          {r.tarea && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              <BookOpen size={12} /> Tarea: {r.tarea.titulo}
            </span>
          )}
          {r.proyecto && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              <Layers size={12} /> Proyecto: {r.proyecto.nombre_proyecto}
            </span>
          )}
          {r.evento && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              <Calendar size={12} /> Evento: {r.evento.titulo}
            </span>
          )}
          {!r.tarea && !r.proyecto && !r.evento && (
            <span className="text-[11px] text-slate-400">General</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isTemp && r.estado === "pendiente" && (
          <>
            <button
              onClick={() => onCambiarEstado(r.id_recordatorio, "enviado")}
              className="btn-secondary text-[11px] py-1 px-2.5 font-medium hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
            >
              Marcar como leído
            </button>
            <button
              onClick={() => onCambiarEstado(r.id_recordatorio, "descartado")}
              className="btn-secondary text-[11px] py-1 px-2.5 font-medium hover:bg-slate-50 hover:text-slate-700"
            >
              Descartar
            </button>
          </>
        )}
        {!isTemp && (
          <button
            onClick={() => onEliminar(r.id_recordatorio)}
            className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 p-1"
            title="Eliminar recordatorio"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
