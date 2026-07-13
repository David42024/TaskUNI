"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { ListChecks, Clock3, CheckCircle2, AlertTriangle, Pencil, Trash2, X } from "lucide-react";
import CardResumen from "@/components/CardResumen";
import ModalConfirmacion from "@/components/ModalConfirmacion";

interface Tarea {
  id_tarea: string;
  titulo: string;
  descripcion: string | null;
  prioridad: "baja" | "media" | "alta";
  estado_tarea: "pendiente" | "en_progreso" | "completada" | "vencida";
  avance_porcentual: number;
  fecha_limite: string | null;
  usuario: { nombres: string; apellidos: string; correo: string };
  curso: { nombre_curso: string } | null;
}

interface DatosEdicion {
  titulo: string;
  prioridad: string;
  estado_tarea: string;
  avance_porcentual: number;
  fecha_limite: string;
}

const colorEstado: Record<string, string> = {
  pendiente: "bg-slate-100 text-slate-600",
  en_progreso: "bg-blue-100 text-blue-700",
  completada: "bg-emerald-100 text-emerald-700",
  vencida: "bg-red-100 text-red-700",
};

export default function AdminTareasPage() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("todos");
  const [editando, setEditando] = useState<Tarea | null>(null);
  const [datos, setDatos] = useState<DatosEdicion | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);

  async function cargar() {
    setCargando(true);
    const res = await fetch("/api/admin/tareas");
    setTareas(await res.json());
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return tareas.filter((t) => {
      const coincideBusqueda =
        !q ||
        t.titulo.toLowerCase().includes(q) ||
        `${t.usuario.nombres} ${t.usuario.apellidos}`.toLowerCase().includes(q) ||
        t.usuario.correo.toLowerCase().includes(q) ||
        t.curso?.nombre_curso.toLowerCase().includes(q);
      const coincideEstado = filtroEstado === "todos" || t.estado_tarea === filtroEstado;
      const coincidePrioridad = filtroPrioridad === "todos" || t.prioridad === filtroPrioridad;
      return coincideBusqueda && coincideEstado && coincidePrioridad;
    });
  }, [tareas, busqueda, filtroEstado, filtroPrioridad]);

  function abrirEdicion(t: Tarea) {
    setEditando(t);
    setError("");
    setDatos({
      titulo: t.titulo,
      prioridad: t.prioridad,
      estado_tarea: t.estado_tarea,
      avance_porcentual: t.avance_porcentual,
      fecha_limite: t.fecha_limite ? t.fecha_limite.substring(0, 10) : "",
    });
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    if (!editando || !datos) return;
    setError("");
    setGuardando(true);
    try {
      const res = await fetch(`/api/admin/tareas/${editando.id_tarea}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: datos.titulo,
          prioridad: datos.prioridad,
          estado_tarea: datos.estado_tarea,
          avance_porcentual: datos.avance_porcentual,
          fecha_limite: datos.fecha_limite || null,
        }),
      });
      const respuesta = await res.json();
      if (!res.ok) throw new Error(respuesta.error || "No se pudo guardar la tarea");
      setEditando(null);
      setDatos(null);
      await cargar();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error");
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar() {
    if (!idAEliminar) return;
    setEliminando(true);
    await fetch(`/api/admin/tareas/${idAEliminar}`, { method: "DELETE" });
    setEliminando(false);
    setIdAEliminar(null);
    await cargar();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tareas registradas</h1>
        <p className="text-slate-500 dark:text-slate-400">Control global de tareas de la plataforma.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardResumen titulo="Total" valor={tareas.length} icon={ListChecks} color="brand" />
        <CardResumen titulo="Pendientes" valor={tareas.filter((t) => t.estado_tarea === "pendiente").length} icon={Clock3} color="amber" />
        <CardResumen titulo="Completadas" valor={tareas.filter((t) => t.estado_tarea === "completada").length} icon={CheckCircle2} color="green" />
        <CardResumen titulo="Vencidas" valor={tareas.filter((t) => t.estado_tarea === "vencida").length} icon={AlertTriangle} color="red" />
      </div>

      <div className="card space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="input max-w-xs"
            placeholder="Buscar por título, estudiante o curso..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select className="input max-w-[180px]" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="completada">Completada</option>
            <option value="vencida">Vencida</option>
          </select>
          <select className="input max-w-[180px]" value={filtroPrioridad} onChange={(e) => setFiltroPrioridad(e.target.value)}>
            <option value="todos">Todas las prioridades</option>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
          <span className="text-xs text-slate-400">{filtradas.length} de {tareas.length} tarea(s)</span>
        </div>

        {cargando ? (
          <p className="text-center text-slate-400">Cargando tareas...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 pr-4 font-medium">Usuario</th>
                  <th className="py-2 pr-4 font-medium">Curso</th>
                  <th className="py-2 pr-4 font-medium">Título</th>
                  <th className="py-2 pr-4 font-medium">Prioridad</th>
                  <th className="py-2 pr-4 font-medium">Estado</th>
                  <th className="py-2 pr-4 font-medium">Avance</th>
                  <th className="py-2 pr-4 font-medium">Fecha límite</th>
                  <th className="py-2 pr-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((t) => (
                  <tr key={t.id_tarea} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-4 text-slate-900 dark:text-white">
                      {t.usuario.nombres} {t.usuario.apellidos}
                    </td>
                    <td className="py-2 pr-4 text-slate-500">{t.curso?.nombre_curso ?? "—"}</td>
                    <td className="py-2 pr-4 text-slate-500">{t.titulo}</td>
                    <td className="py-2 pr-4 text-slate-500 capitalize">{t.prioridad}</td>
                    <td className="py-2 pr-4">
                      <span className={clsx("badge", colorEstado[t.estado_tarea])}>{t.estado_tarea}</span>
                    </td>
                    <td className="py-2 pr-4 text-slate-500">{t.avance_porcentual}%</td>
                    <td className="py-2 pr-4 text-slate-500">
                      {t.fecha_limite ? new Date(t.fecha_limite).toLocaleDateString("es-PE") : "—"}
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => abrirEdicion(t)} className="text-slate-400 hover:text-brand-600" title="Editar">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setIdAEliminar(t.id_tarea)} className="text-slate-400 hover:text-red-500" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtradas.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-400">
                      No se encontraron tareas con esos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editando && datos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Editar tarea</h3>
              <button onClick={() => setEditando(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleGuardar} className="space-y-4">
              {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
              <div>
                <label className="label">Título</label>
                <input className="input" value={datos.titulo} onChange={(e) => setDatos({ ...datos, titulo: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Prioridad</label>
                  <select className="input" value={datos.prioridad} onChange={(e) => setDatos({ ...datos, prioridad: e.target.value })}>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                <div>
                  <label className="label">Estado</label>
                  <select className="input" value={datos.estado_tarea} onChange={(e) => setDatos({ ...datos, estado_tarea: e.target.value })}>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_progreso">En progreso</option>
                    <option value="completada">Completada</option>
                    <option value="vencida">Vencida</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Fecha límite</label>
                  <input
                    type="date"
                    className="input"
                    value={datos.fecha_limite}
                    onChange={(e) => setDatos({ ...datos, fecha_limite: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Avance: {datos.avance_porcentual}%</label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    className="mt-2.5 w-full accent-brand-600"
                    value={datos.avance_porcentual}
                    onChange={(e) => setDatos({ ...datos, avance_porcentual: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditando(null)} className="btn-secondary" disabled={guardando}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ModalConfirmacion
        abierto={Boolean(idAEliminar)}
        titulo="Eliminar tarea"
        mensaje="Esta acción no se puede deshacer. ¿Deseas continuar?"
        onConfirmar={handleEliminar}
        onCancelar={() => setIdAEliminar(null)}
        cargando={eliminando}
      />
    </div>
  );
}
