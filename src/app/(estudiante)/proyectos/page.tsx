"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, X, UserPlus, Trash2 } from "lucide-react";
import clsx from "clsx";
import FormularioProyecto, { DatosProyecto } from "@/components/FormularioProyecto";
import ModalConfirmacion from "@/components/ModalConfirmacion";

interface TareaProyecto {
  id_tarea_proyecto: string;
  titulo: string;
  estado: string;
  prioridad: string;
  id_usuario_asignado: string | null;
}

interface Integrante {
  id_integrante: string;
  rol_en_proyecto: string;
  responsabilidad: string | null;
  estado: string;
  usuario: { nombres: string; apellidos: string; correo: string };
}

interface Proyecto {
  id_proyecto: string;
  id_curso: string | null;
  nombre_proyecto: string;
  descripcion: string | null;
  fecha_entrega: string | null;
  estado_proyecto: string;
  avance_general: number;
  integrantes: Integrante[];
  tareas: TareaProyecto[];
  creador: { nombres: string; apellidos: string };
}

const columnas = [
  { estado: "pendiente", titulo: "Pendiente" },
  { estado: "en_progreso", titulo: "En progreso" },
  { estado: "completada", titulo: "Completada" },
];

export default function ProyectosPage() {
  return (
    <Suspense fallback={<div className="card text-center text-slate-400">Cargando proyectos...</div>}>
      <ProyectosContenido />
    </Suspense>
  );
}

function ProyectosContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cursoIdFiltro = searchParams.get("curso");
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalProyectoAbierto, setModalProyectoAbierto] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<Proyecto | null>(null);
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [tituloNuevaTarea, setTituloNuevaTarea] = useState("");
  const [correoInvitar, setCorreoInvitar] = useState("");
  const [errorInvitar, setErrorInvitar] = useState("");

  async function cargarProyectos() {
    setCargando(true);
    const res = await fetch("/api/proyectos");
    const data = await res.json();
    setProyectos(data);
    if (proyectoSeleccionado) {
      const actualizado = data.find((p: Proyecto) => p.id_proyecto === proyectoSeleccionado.id_proyecto);
      setProyectoSeleccionado(actualizado ?? null);
    }
    setCargando(false);
  }

  useEffect(() => {
    cargarProyectos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCrearProyecto(datos: DatosProyecto) {
    const res = await fetch("/api/proyectos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "No se pudo crear el proyecto");
    setModalProyectoAbierto(false);
    await cargarProyectos();
  }

  async function handleEliminarProyecto() {
    if (!idAEliminar) return;
    setEliminando(true);
    await fetch(`/api/proyectos/${idAEliminar}`, { method: "DELETE" });
    setEliminando(false);
    setIdAEliminar(null);
    if (proyectoSeleccionado?.id_proyecto === idAEliminar) setProyectoSeleccionado(null);
    await cargarProyectos();
  }

  async function handleCrearTareaKanban() {
    if (!proyectoSeleccionado || tituloNuevaTarea.trim().length < 2) return;
    await fetch(`/api/proyectos/${proyectoSeleccionado.id_proyecto}/tareas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo: tituloNuevaTarea }),
    });
    setTituloNuevaTarea("");
    await cargarProyectos();
  }

  async function moverTarea(id_tarea_proyecto: string, nuevoEstado: string) {
    await fetch(`/api/tareas-proyecto/${id_tarea_proyecto}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    await cargarProyectos();
  }

  async function eliminarTareaKanban(id_tarea_proyecto: string) {
    await fetch(`/api/tareas-proyecto/${id_tarea_proyecto}`, { method: "DELETE" });
    await cargarProyectos();
  }

  async function handleInvitar() {
    if (!proyectoSeleccionado) return;
    setErrorInvitar("");
    const res = await fetch(`/api/proyectos/${proyectoSeleccionado.id_proyecto}/integrantes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: correoInvitar }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErrorInvitar(data.error || "No se pudo invitar al integrante");
      return;
    }
    setCorreoInvitar("");
    await cargarProyectos();
  }

  if (proyectoSeleccionado) {
    const p = proyectoSeleccionado;
    return (
      <div className="space-y-6">
        <button onClick={() => setProyectoSeleccionado(null)} className="text-sm text-brand-600 hover:underline">
          ← Volver a proyectos
        </button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{p.nombre_proyecto}</h1>
            <p className="text-slate-500">{p.descripcion}</p>
          </div>
          <span className="badge bg-brand-100 text-brand-700">{p.avance_general}% completado</span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              <div className="mb-3 flex items-center gap-2">
                <input
                  className="input"
                  placeholder="Nueva tarea del tablero..."
                  value={tituloNuevaTarea}
                  onChange={(e) => setTituloNuevaTarea(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCrearTareaKanban()}
                />
                <button className="btn-primary" onClick={handleCrearTareaKanban}>
                  <Plus size={16} />
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {columnas.map((col) => (
                  <div key={col.estado} className="rounded-lg bg-slate-50 p-3">
                    <h4 className="mb-2 text-sm font-semibold text-slate-600">{col.titulo}</h4>
                    <div className="space-y-2">
                      {p.tareas
                        .filter((t) => t.estado === col.estado)
                        .map((t) => (
                          <div key={t.id_tarea_proyecto} className="rounded-lg border border-slate-200 bg-white p-2.5 text-sm">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-medium text-slate-800">{t.titulo}</span>
                              <button
                                onClick={() => eliminarTareaKanban(t.id_tarea_proyecto)}
                                className="text-slate-300 hover:text-red-500"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <div className="mt-2 flex gap-1">
                              {columnas
                                .filter((c) => c.estado !== t.estado)
                                .map((c) => (
                                  <button
                                    key={c.estado}
                                    onClick={() => moverTarea(t.id_tarea_proyecto, c.estado)}
                                    className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 hover:bg-brand-100 hover:text-brand-700"
                                  >
                                    → {c.titulo}
                                  </button>
                                ))}
                            </div>
                          </div>
                        ))}
                      {p.tareas.filter((t) => t.estado === col.estado).length === 0 && (
                        <p className="text-xs text-slate-300">Sin tareas</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card">
              <h4 className="mb-3 font-semibold text-slate-800">Integrantes</h4>
              <ul className="space-y-2">
                {p.integrantes.map((i) => (
                  <li key={i.id_integrante} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-slate-700">
                        {i.usuario.nombres} {i.usuario.apellidos}
                      </p>
                      <p className="text-xs text-slate-400">{i.responsabilidad ?? i.rol_en_proyecto}</p>
                    </div>
                    <span
                      className={clsx(
                        "badge text-[11px]",
                        i.estado === "activo" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                      )}
                    >
                      {i.estado}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 border-t border-slate-100 pt-3">
                {errorInvitar && <p className="mb-2 text-xs text-red-600">{errorInvitar}</p>}
                <div className="flex gap-2">
                  <input
                    className="input"
                    placeholder="correo@unt.edu.pe"
                    value={correoInvitar}
                    onChange={(e) => setCorreoInvitar(e.target.value)}
                  />
                  <button className="btn-secondary" onClick={handleInvitar} title="Invitar integrante">
                    <UserPlus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const proyectosVisibles = cursoIdFiltro
    ? proyectos.filter((p) => p.id_curso === cursoIdFiltro)
    : proyectos;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Proyectos grupales</h1>
          <p className="text-slate-500">Coordina a tu equipo y da seguimiento al avance.</p>
        </div>
        <button className="btn-primary" onClick={() => setModalProyectoAbierto(true)}>
          <Plus size={16} className="mr-1" /> Nuevo proyecto
        </button>
      </div>

      {cursoIdFiltro && (
        <div className="card flex items-center justify-between gap-3 bg-brand-50 text-sm text-brand-700">
          <span>Mostrando proyectos de este curso</span>
          <button className="btn-secondary text-xs" onClick={() => router.push("/proyectos")}>
            Ver todos
          </button>
        </div>
      )}

      {cargando ? (
        <div className="card text-center text-slate-400">Cargando proyectos...</div>
      ) : proyectosVisibles.length === 0 ? (
        <div className="card text-center text-slate-400">Aún no tienes proyectos grupales.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {proyectosVisibles.map((p) => (
            <div key={p.id_proyecto} className="card cursor-pointer hover:shadow-md" onClick={() => setProyectoSeleccionado(p)}>
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-slate-900">{p.nombre_proyecto}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIdAEliminar(p.id_proyecto);
                  }}
                  className="text-slate-300 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{p.descripcion}</p>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${p.avance_general}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                <span>{p.integrantes.length} integrante(s)</span>
                <span>{p.avance_general}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalProyectoAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Nuevo proyecto</h3>
              <button onClick={() => setModalProyectoAbierto(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <FormularioProyecto onGuardar={handleCrearProyecto} onCancelar={() => setModalProyectoAbierto(false)} />
          </div>
        </div>
      )}

      <ModalConfirmacion
        abierto={Boolean(idAEliminar)}
        titulo="Eliminar proyecto"
        mensaje="Se eliminará el proyecto junto con sus tareas e integrantes. Esta acción no se puede deshacer."
        onConfirmar={handleEliminarProyecto}
        onCancelar={() => setIdAEliminar(null)}
        cargando={eliminando}
      />
    </div>
  );
}
