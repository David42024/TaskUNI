"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { Pencil, Trash2 } from "lucide-react";

export interface TareaVista {
  id_tarea: string;
  titulo: string;
  descripcion?: string | null;
  id_curso?: string | null;
  fecha_limite?: string | null;
  prioridad: "baja" | "media" | "alta";
  estado_tarea: "pendiente" | "en_progreso" | "completada" | "vencida";
  avance_porcentual: number;
  curso?: { nombre_curso: string } | null;
}

interface Props {
  tareas: TareaVista[];
  onEditar: (tarea: TareaVista) => void;
  onEliminar: (id_tarea: string) => void;
}

const colorPrioridad: Record<string, string> = {
  baja: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200",
  media: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-200",
  alta: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200",
};

const colorEstado: Record<string, string> = {
  pendiente: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200",
  en_progreso: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-200",
  completada: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
  vencida: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200",
};

const etiquetaEstado: Record<string, string> = {
  pendiente: "Pendiente",
  en_progreso: "En progreso",
  completada: "Completada",
  vencida: "Vencida",
};

export default function TablaTareas({ tareas, onEditar, onEliminar }: Props) {
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [filtroPrioridad, setFiltroPrioridad] = useState("todas");
  const [busqueda, setBusqueda] = useState("");

  const tareasFiltradas = useMemo(() => {
    return tareas.filter((t) => {
      if (filtroEstado !== "todas" && t.estado_tarea !== filtroEstado) return false;
      if (filtroPrioridad !== "todas" && t.prioridad !== filtroPrioridad) return false;
      if (busqueda && !t.titulo.toLowerCase().includes(busqueda.toLowerCase())) return false;
      return true;
    });
  }, [tareas, filtroEstado, filtroPrioridad, busqueda]);

  return (
    <div className="card">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          className="input max-w-xs"
          placeholder="Buscar tarea..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select className="input max-w-[10rem]" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="todas">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En progreso</option>
          <option value="completada">Completada</option>
          <option value="vencida">Vencida</option>
        </select>
        <select
          className="input max-w-[10rem]"
          value={filtroPrioridad}
          onChange={(e) => setFiltroPrioridad(e.target.value)}
        >
          <option value="todas">Toda prioridad</option>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
        </select>
        <span className="ml-auto text-sm text-slate-400 dark:text-slate-500">
          {tareasFiltradas.length} de {tareas.length} tareas
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-400">
              <th className="py-2 pr-4 font-medium">Tarea</th>
              <th className="py-2 pr-4 font-medium">Curso</th>
              <th className="py-2 pr-4 font-medium">Fecha límite</th>
              <th className="py-2 pr-4 font-medium">Prioridad</th>
              <th className="py-2 pr-4 font-medium">Estado</th>
              <th className="py-2 pr-4 font-medium">Avance</th>
              <th className="py-2 pr-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tareasFiltradas.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400">
                  No hay tareas que coincidan con los filtros.
                </td>
              </tr>
            )}
            {tareasFiltradas.map((t) => (
              <tr key={t.id_tarea} className="border-b border-slate-100 last:border-0">
                <td className="py-3 pr-4 font-medium text-slate-800 dark:text-white">{t.titulo}</td>
                <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{t.curso?.nombre_curso ?? "—"}</td>
                <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">
                  {t.fecha_limite ? new Date(t.fecha_limite).toLocaleDateString("es-PE") : "—"}
                </td>
                <td className="py-3 pr-4">
                  <span className={clsx("badge capitalize", colorPrioridad[t.prioridad])}>
                    {t.prioridad}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <span className={clsx("badge", colorEstado[t.estado_tarea])}>
                    {etiquetaEstado[t.estado_tarea]}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${t.avance_porcentual}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{t.avance_porcentual}%</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEditar(t)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-brand-600 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-brand-300"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onEliminar(t.id_tarea)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
