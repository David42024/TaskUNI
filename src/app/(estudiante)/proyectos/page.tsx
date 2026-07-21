"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, X, UserPlus, Trash2, Edit2, Play, Pause } from "lucide-react";
import { useSession } from "next-auth/react";
import clsx from "clsx";
import FormularioProyecto, { DatosProyecto } from "@/components/FormularioProyecto";
import ModalConfirmacion from "@/components/ModalConfirmacion";

interface TareaProyecto {
  id_tarea_proyecto: string;
  id_proyecto: string;
  id_usuario_asignado: string | null;
  titulo: string;
  descripcion: string | null;
  estado: string;
  prioridad: string;
  fecha_limite: string | null;
  avance_porcentual: number;
  asignado?: { id_usuario: string; nombres: string; apellidos: string; correo: string } | null;
}

interface Integrante {
  id_integrante: string;
  id_usuario: string;
  rol_en_proyecto: string;
  responsabilidad: string | null;
  estado: string;
  usuario: { nombres: string; apellidos: string; correo: string };
}

interface Proyecto {
  id_proyecto: string;
  id_usuario_creador: string;
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
  const { data: session } = useSession();
  const currentUser = session?.user;
  const searchParams = useSearchParams();
  const cursoIdFiltro = searchParams?.get("curso") ?? null;
  
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalProyectoAbierto, setModalProyectoAbierto] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<Proyecto | null>(null);
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);
  
  // States for new task creation
  const [tituloNuevaTarea, setTituloNuevaTarea] = useState("");
  const [fechaNuevaTarea, setFechaNuevaTarea] = useState("");
  const [asignadoNuevaTarea, setAsignadoNuevaTarea] = useState("");

  // States for inviting member
  const [correoInvitar, setCorreoInvitar] = useState("");
  const [rolInvitar, setRolInvitar] = useState("miembro");
  const [errorInvitar, setErrorInvitar] = useState("");

  // States for task edit sidebar
  const [tareaSeleccionada, setTareaSeleccionada] = useState<TareaProyecto | null>(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editFechaLimite, setEditFechaLimite] = useState("");
  const [editPrioridad, setEditPrioridad] = useState("media");
  const [editAsignado, setEditAsignado] = useState("");
  const [editAvance, setEditAvance] = useState(0);

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

  // --- OPTIMISTIC UI METHODS ---

  async function handleCrearTareaKanban() {
    if (!proyectoSeleccionado || tituloNuevaTarea.trim().length < 2) return;

    // 1. Keep rollback backup
    const prevProyectos = [...proyectos];
    const prevSeleccionado = proyectoSeleccionado ? { ...proyectoSeleccionado } : null;

    // Find assignee details locally to show it instantly
    let asignadoObj = null;
    if (asignadoNuevaTarea) {
      if (asignadoNuevaTarea === proyectoSeleccionado.id_usuario_creador) {
        asignadoObj = {
          id_usuario: proyectoSeleccionado.id_usuario_creador,
          nombres: proyectoSeleccionado.creador?.nombres || "",
          apellidos: proyectoSeleccionado.creador?.apellidos || "",
          correo: "",
        };
      } else {
        const member = proyectoSeleccionado.integrantes.find(
          (i) => i.id_usuario === asignadoNuevaTarea
        );
        if (member) {
          asignadoObj = {
            id_usuario: member.id_usuario,
            nombres: member.usuario.nombres,
            apellidos: member.usuario.apellidos,
            correo: member.usuario.correo,
          };
        }
      }
    }

    const tempId = `temp-${Date.now()}`;
    const tempTask: TareaProyecto = {
      id_tarea_proyecto: tempId,
      id_proyecto: proyectoSeleccionado.id_proyecto,
      id_usuario_asignado: asignadoNuevaTarea || null,
      titulo: tituloNuevaTarea,
      descripcion: "",
      estado: "pendiente",
      prioridad: "media",
      fecha_limite: fechaNuevaTarea ? new Date(fechaNuevaTarea).toISOString() : null,
      avance_porcentual: 0,
      asignado: asignadoObj,
    };

    // 2. Apply optimistic update
    const nuevosProyectos = proyectos.map((p) => {
      if (p.id_proyecto === proyectoSeleccionado.id_proyecto) {
        return {
          ...p,
          tareas: [...p.tareas, tempTask],
        };
      }
      return p;
    });
    setProyectos(nuevosProyectos);

    const nuevoSeleccionado = nuevosProyectos.find(
      (p) => p.id_proyecto === proyectoSeleccionado.id_proyecto
    );
    setProyectoSeleccionado(nuevoSeleccionado ?? null);

    // Save current values to request body
    const postTitulo = tituloNuevaTarea;
    const postFecha = fechaNuevaTarea;
    const postAsignado = asignadoNuevaTarea;

    // Reset inputs immediately
    setTituloNuevaTarea("");
    setFechaNuevaTarea("");
    setAsignadoNuevaTarea("");

    // 3. Make HTTP request in background
    try {
      const res = await fetch(`/api/proyectos/${proyectoSeleccionado.id_proyecto}/tareas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: postTitulo,
          fecha_limite: postFecha || null,
          id_usuario_asignado: postAsignado || null,
        }),
      });
      if (!res.ok) throw new Error();
      // Sync silent background update
      const resData = await fetch("/api/proyectos");
      const data = await resData.json();
      setProyectos(data);
      setProyectoSeleccionado(data.find((p: Proyecto) => p.id_proyecto === proyectoSeleccionado.id_proyecto) ?? null);
    } catch (err) {
      // Rollback
      setProyectos(prevProyectos);
      setProyectoSeleccionado(prevSeleccionado);
      alert("Error al crear la tarea. Se ha revertido el cambio.");
    }
  }

  async function moverTarea(id_tarea_proyecto: string, nuevoEstado: string) {
    const prevProyectos = [...proyectos];
    const prevSeleccionado = proyectoSeleccionado ? { ...proyectoSeleccionado } : null;

    const nuevosProyectos = proyectos.map((p) => {
      return {
        ...p,
        tareas: p.tareas.map((t) => {
          if (t.id_tarea_proyecto === id_tarea_proyecto) {
            return { ...t, estado: nuevoEstado };
          }
          return t;
        }),
      };
    });
    setProyectos(nuevosProyectos);

    if (proyectoSeleccionado) {
      const nuevoSeleccionado = nuevosProyectos.find(
        (p) => p.id_proyecto === proyectoSeleccionado.id_proyecto
      );
      setProyectoSeleccionado(nuevoSeleccionado ?? null);
    }

    try {
      const res = await fetch(`/api/tareas-proyecto/${id_tarea_proyecto}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (!res.ok) throw new Error();
      // Sync silently
      const resData = await fetch("/api/proyectos");
      const data = await resData.json();
      setProyectos(data);
      if (proyectoSeleccionado) {
        setProyectoSeleccionado(data.find((p: Proyecto) => p.id_proyecto === proyectoSeleccionado.id_proyecto) ?? null);
      }
    } catch (err) {
      setProyectos(prevProyectos);
      setProyectoSeleccionado(prevSeleccionado);
      alert("Error al mover la tarea. Se ha revertido el cambio.");
    }
  }

  async function eliminarTareaKanban(id_tarea_proyecto: string) {
    const prevProyectos = [...proyectos];
    const prevSeleccionado = proyectoSeleccionado ? { ...proyectoSeleccionado } : null;

    const nuevosProyectos = proyectos.map((p) => {
      return {
        ...p,
        tareas: p.tareas.filter((t) => t.id_tarea_proyecto !== id_tarea_proyecto),
      };
    });
    setProyectos(nuevosProyectos);

    if (proyectoSeleccionado) {
      const nuevoSeleccionado = nuevosProyectos.find(
        (p) => p.id_proyecto === proyectoSeleccionado.id_proyecto
      );
      setProyectoSeleccionado(nuevoSeleccionado ?? null);
    }

    try {
      const res = await fetch(`/api/tareas-proyecto/${id_tarea_proyecto}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      // Sync silently
      const resData = await fetch("/api/proyectos");
      const data = await resData.json();
      setProyectos(data);
      if (proyectoSeleccionado) {
        setProyectoSeleccionado(data.find((p: Proyecto) => p.id_proyecto === proyectoSeleccionado.id_proyecto) ?? null);
      }
    } catch (err) {
      setProyectos(prevProyectos);
      setProyectoSeleccionado(prevSeleccionado);
      alert("Error al eliminar la tarea. Se ha revertido el cambio.");
    }
  }

  async function handleGuardarTarea() {
    if (!tareaSeleccionada || !proyectoSeleccionado) return;

    const prevProyectos = [...proyectos];
    const prevSeleccionado = { ...proyectoSeleccionado };

    // Find assignee details locally
    let asignadoObj = null;
    if (editAsignado) {
      if (editAsignado === proyectoSeleccionado.id_usuario_creador) {
        asignadoObj = {
          id_usuario: proyectoSeleccionado.id_usuario_creador,
          nombres: proyectoSeleccionado.creador?.nombres || "",
          apellidos: proyectoSeleccionado.creador?.apellidos || "",
          correo: "",
        };
      } else {
        const member = proyectoSeleccionado.integrantes.find(
          (i) => i.id_usuario === editAsignado
        );
        if (member) {
          asignadoObj = {
            id_usuario: member.id_usuario,
            nombres: member.usuario.nombres,
            apellidos: member.usuario.apellidos,
            correo: member.usuario.correo,
          };
        }
      }
    }

    const nuevosProyectos = proyectos.map((p) => {
      return {
        ...p,
        tareas: p.tareas.map((t) => {
          if (t.id_tarea_proyecto === tareaSeleccionada.id_tarea_proyecto) {
            return {
              ...t,
              titulo: editTitulo,
              descripcion: editDescripcion || null,
              fecha_limite: editFechaLimite ? new Date(editFechaLimite).toISOString() : null,
              prioridad: editPrioridad,
              id_usuario_asignado: editAsignado || null,
              avance_porcentual: Number(editAvance),
              asignado: asignadoObj,
            };
          }
          return t;
        }),
      };
    });
    setProyectos(nuevosProyectos);

    const nuevoSeleccionado = nuevosProyectos.find(
      (p) => p.id_proyecto === proyectoSeleccionado.id_proyecto
    );
    setProyectoSeleccionado(nuevoSeleccionado ?? null);

    setTareaSeleccionada(null);

    try {
      const res = await fetch(`/api/tareas-proyecto/${tareaSeleccionada.id_tarea_proyecto}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: editTitulo,
          descripcion: editDescripcion || null,
          fecha_limite: editFechaLimite || null,
          prioridad: editPrioridad,
          id_usuario_asignado: editAsignado || null,
          avance_porcentual: Number(editAvance),
        }),
      });
      if (!res.ok) throw new Error();
      // Sync silently
      const resData = await fetch("/api/proyectos");
      const data = await resData.json();
      setProyectos(data);
      if (proyectoSeleccionado) {
        setProyectoSeleccionado(data.find((p: Proyecto) => p.id_proyecto === proyectoSeleccionado.id_proyecto) ?? null);
      }
    } catch (err) {
      setProyectos(prevProyectos);
      setProyectoSeleccionado(prevSeleccionado);
      alert("Error al guardar la tarea. Se han revertido los cambios.");
    }
  }

  async function handleAceptarInvitacion(proyectoId: string) {
    const prevProyectos = [...proyectos];

    const nuevosProyectos = proyectos.map((p) => {
      if (p.id_proyecto === proyectoId) {
        return {
          ...p,
          integrantes: p.integrantes.map((i) => {
            if (i.usuario.correo === currentUser?.email) {
              return { ...i, estado: "activo" };
            }
            return i;
          }),
        };
      }
      return p;
    });
    setProyectos(nuevosProyectos);

    try {
      const res = await fetch(`/api/proyectos/${proyectoId}/integrantes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "activo" }),
      });
      if (!res.ok) throw new Error();
      // Sync silently
      const resData = await fetch("/api/proyectos");
      const data = await resData.json();
      setProyectos(data);
    } catch (err) {
      setProyectos(prevProyectos);
      alert("Error al aceptar la invitación. Se ha revertido el cambio.");
    }
  }

  async function handleRechazarInvitacion(proyectoId: string) {
    const prevProyectos = [...proyectos];

    const nuevosProyectos = proyectos.filter((p) => p.id_proyecto !== proyectoId);
    setProyectos(nuevosProyectos);

    try {
      const res = await fetch(`/api/proyectos/${proyectoId}/integrantes`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: currentUser?.id }),
      });
      if (!res.ok) throw new Error();
      // Sync silently
      const resData = await fetch("/api/proyectos");
      const data = await resData.json();
      setProyectos(data);
    } catch (err) {
      setProyectos(prevProyectos);
      alert("Error al rechazar la invitación. Se ha revertido el cambio.");
    }
  }

  async function handleTogglePausarProyecto(nuevoEstado: string) {
    if (!proyectoSeleccionado) return;
    const prevProyectos = [...proyectos];
    const prevSeleccionado = { ...proyectoSeleccionado };

    const nuevosProyectos = proyectos.map((p) => {
      if (p.id_proyecto === proyectoSeleccionado.id_proyecto) {
        return { ...p, estado_proyecto: nuevoEstado };
      }
      return p;
    });
    setProyectos(nuevosProyectos);
    setProyectoSeleccionado({ ...proyectoSeleccionado, estado_proyecto: nuevoEstado });

    try {
      const res = await fetch(`/api/proyectos/${proyectoSeleccionado.id_proyecto}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado_proyecto: nuevoEstado }),
      });
      if (!res.ok) throw new Error();
      // Sync silently
      const resData = await fetch("/api/proyectos");
      const data = await resData.json();
      setProyectos(data);
      setProyectoSeleccionado(data.find((p: Proyecto) => p.id_proyecto === proyectoSeleccionado.id_proyecto) ?? null);
    } catch (err) {
      setProyectos(prevProyectos);
      setProyectoSeleccionado(prevSeleccionado);
      alert("Error al cambiar el estado del proyecto. Se ha revertido el cambio.");
    }
  }

  async function handleInvitar() {
    if (!proyectoSeleccionado) return;
    setErrorInvitar("");
    const res = await fetch(`/api/proyectos/${proyectoSeleccionado.id_proyecto}/integrantes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ correo: correoInvitar, rol_en_proyecto: rolInvitar }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErrorInvitar(data.error || "No se pudo invitar al integrante");
      return;
    }
    setCorreoInvitar("");
    setRolInvitar("miembro");
    await cargarProyectos();
  }

  // --- END OPTIMISTIC UI METHODS ---

  const abrirEditorTarea = (t: TareaProyecto) => {
    setTareaSeleccionada(t);
    setEditTitulo(t.titulo);
    setEditDescripcion(t.descripcion ?? "");
    setEditFechaLimite(t.fecha_limite ? t.fecha_limite.split("T")[0] : "");
    setEditPrioridad(t.prioridad);
    setEditAsignado(t.id_usuario_asignado ?? "");
    setEditAvance(t.avance_porcentual);
  };

  // Split projects: active vs invitations
  const invitaciones = proyectos.filter((p) => {
    const isCreator = p.id_usuario_creador === currentUser?.id;
    const miMembresia = p.integrantes.find((i) => i.usuario.correo === currentUser?.email);
    return miMembresia && miMembresia.estado === "invitado" && !isCreator;
  });

  const proyectosActivos = proyectos.filter((p) => {
    const isCreator = p.id_usuario_creador === currentUser?.id;
    const miMembresia = p.integrantes.find((i) => i.usuario.correo === currentUser?.email);
    return isCreator || (miMembresia && miMembresia.estado === "activo");
  });

  const proyectosVisibles = cursoIdFiltro
    ? proyectosActivos.filter((p) => p.id_curso === cursoIdFiltro)
    : proyectosActivos;

  if (proyectoSeleccionado) {
    const p = proyectos.find((proj) => proj.id_proyecto === proyectoSeleccionado.id_proyecto) || proyectoSeleccionado;
    const isCreator = p.id_usuario_creador === currentUser?.id;
    const miMembresia = p.integrantes.find((i) => i.usuario.correo === currentUser?.email);
    const miRol = miMembresia ? miMembresia.rol_en_proyecto : (isCreator ? "líder" : null);
    const isReadOnly = miRol === "solo_lectura";
    const isDocenteOrCreator = isCreator || miRol === "docente";
    const isProjectPaused = p.estado_proyecto === "pausado";
    const canEditTasks = !isProjectPaused ? (miRol !== "solo_lectura") : isDocenteOrCreator;

    return (
      <div className="space-y-6">
        <button onClick={() => setProyectoSeleccionado(null)} className="text-sm text-brand-600 hover:underline">
          ← Volver a proyectos
        </button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{p.nombre_proyecto}</h1>
              {isProjectPaused && (
                <span className="badge bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300">Pausado</span>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400">{p.descripcion}</p>
          </div>
          <div className="flex items-center gap-3">
            {isDocenteOrCreator && (
              <button
                onClick={() => handleTogglePausarProyecto(isProjectPaused ? "en_progreso" : "pausado")}
                className={clsx(
                  "btn-secondary text-xs flex items-center gap-1.5",
                  isProjectPaused ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50" : "border-red-200 text-red-700 hover:bg-red-50"
                )}
              >
                {isProjectPaused ? <Play size={14} /> : <Pause size={14} />}
                {isProjectPaused ? "Reanudar proyecto" : "Pausar proyecto"}
              </button>
            )}
            <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">{p.avance_general}% completado</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              {/* Inline task creation */}
              {canEditTasks && (
                <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 dark:border-white/10 dark:bg-white/5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Crear nueva tarea del tablero</h4>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Nombre</label>
                      <input
                        className="input"
                        placeholder="Título de la tarea..."
                        value={tituloNuevaTarea}
                        onChange={(e) => setTituloNuevaTarea(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Fecha límite</label>
                      <input
                        type="date"
                        className="input"
                        value={fechaNuevaTarea}
                        onChange={(e) => setFechaNuevaTarea(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Asignado a</label>
                      <select
                        className="input"
                        value={asignadoNuevaTarea}
                        onChange={(e) => setAsignadoNuevaTarea(e.target.value)}
                      >
                        <option value="">Sin asignar</option>
                        <option value={p.id_usuario_creador}>
                          {p.creador?.nombres} {p.creador?.apellidos} (Creador)
                        </option>
                        {p.integrantes
                          .filter((i) => i.estado === "activo" && i.id_usuario !== p.id_usuario_creador)
                          .map((i) => (
                            <option key={i.id_integrante} value={i.id_usuario}>
                              {i.usuario.nombres} {i.usuario.apellidos} ({i.rol_en_proyecto})
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={handleCrearTareaKanban}
                      disabled={tituloNuevaTarea.trim().length < 2}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Crear tarea
                    </button>
                  </div>
                </div>
              )}

              {/* Draggable Kanban columns */}
              <div className="grid gap-4 sm:grid-cols-3">
                {columnas.map((col) => (
                  <div
                    key={col.estado}
                    onDragOver={(e) => {
                      if (canEditTasks) e.preventDefault();
                    }}
                    onDrop={(e) => {
                      if (canEditTasks) {
                        const taskId = e.dataTransfer.getData("text/plain");
                        // Ignore drop if dragging a temporary card
                        if (taskId.startsWith("temp-")) return;
                        moverTarea(taskId, col.estado);
                      }
                    }}
                    className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5"
                  >
                    <h4 className="mb-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{col.titulo}</h4>
                    <div className="space-y-2 min-h-[150px]">
                      {p.tareas
                        .filter((t) => t.estado === col.estado)
                        .map((t) => {
                          const isTemp = t.id_tarea_proyecto.startsWith("temp-");
                          return (
                            <div
                              key={t.id_tarea_proyecto}
                              draggable={canEditTasks && !isTemp}
                              onDragStart={(e) => {
                                if (isTemp) {
                                  e.preventDefault();
                                  return;
                                }
                                e.dataTransfer.setData("text/plain", t.id_tarea_proyecto);
                              }}
                              onClick={() => {
                                if (!isTemp) abrirEditorTarea(t);
                              }}
                              className={clsx(
                                "rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm hover:border-brand-200 dark:border-white/10 dark:bg-slate-900 dark:hover:border-brand-400/50",
                                isTemp ? "opacity-60 cursor-wait" : "cursor-grab active:cursor-grabbing"
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-medium text-slate-800 dark:text-white">{t.titulo}</span>
                                {canEditTasks && !isTemp && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      eliminarTareaKanban(t.id_tarea_proyecto);
                                    }}
                                    className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>

                              {/* Properties (max 3, not overlapping) */}
                              <div className="mt-2.5 space-y-1 text-xs text-slate-400 dark:text-slate-500">
                                {t.asignado && (
                                  <div className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                                    <span>👤 {t.asignado.nombres} {t.asignado.apellidos}</span>
                                  </div>
                                )}
                                {t.fecha_limite && (
                                  <div className="flex items-center gap-1.5">
                                    <span>📅 {new Date(t.fecha_limite).toLocaleDateString("es-PE")}</span>
                                  </div>
                                )}
                                {t.prioridad && (
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={clsx(
                                        "px-1.5 py-0.5 rounded text-[10px] uppercase font-bold",
                                        t.prioridad === "alta"
                                          ? "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                                          : t.prioridad === "media"
                                          ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                                          : "bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300"
                                      )}
                                    >
                                      {t.prioridad}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      {p.tareas.filter((t) => t.estado === col.estado).length === 0 && (
                        <p className="text-xs text-slate-300 text-center py-4 dark:text-slate-600">Sin tareas</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card">
              <h4 className="mb-3 font-semibold text-slate-800 dark:text-white">Integrantes</h4>
              <ul className="space-y-2.5">
                {/* Creator */}
                <li className="flex items-center justify-between text-sm border-b border-slate-100 pb-2 dark:border-white/5">
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      {p.creador?.nombres} {p.creador?.apellidos}
                    </p>
                    <p className="text-xs text-slate-400">Creador / Líder</p>
                  </div>
                  <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">líder</span>
                </li>
                {/* Invited members */}
                {p.integrantes
                  .filter((i) => i.id_usuario !== p.id_usuario_creador)
                  .map((i) => (
                    <li key={i.id_integrante} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-300">
                          {i.usuario.nombres} {i.usuario.apellidos}
                        </p>
                        <p className="text-xs text-slate-400 capitalize">{i.rol_en_proyecto.replace("_", " ")}</p>
                      </div>
                      <span
                        className={clsx(
                          "badge text-[11px]",
                          i.estado === "activo"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                        )}
                      >
                        {i.estado === "invitado" ? "invitación enviada" : i.estado}
                      </span>
                    </li>
                  ))}
              </ul>

              {/* Only show invitation form if not read-only and not paused */}
              {!isReadOnly && !isProjectPaused && (
                <div className="mt-4 border-t border-slate-100 pt-3 dark:border-white/5">
                  {errorInvitar && <p className="mb-2 text-xs text-red-600">{errorInvitar}</p>}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        className="input"
                        placeholder="correo@unt.edu.pe"
                        value={correoInvitar}
                        onChange={(e) => setCorreoInvitar(e.target.value)}
                      />
                      <select
                        className="input max-w-[120px] text-xs"
                        value={rolInvitar}
                        onChange={(e) => setRolInvitar(e.target.value)}
                      >
                        <option value="miembro">Miembro</option>
                        <option value="docente">Docente</option>
                        <option value="solo_lectura">Solo lectura</option>
                      </select>
                    </div>
                    <button className="btn-secondary flex items-center justify-center gap-1.5 text-xs py-2" onClick={handleInvitar}>
                      <UserPlus size={14} /> Invitar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task Edit Sidebar */}
        {tareaSeleccionada && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 p-0 backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setTareaSeleccionada(null)}
              className="absolute inset-0 bg-transparent cursor-default"
            />
            <div className="relative h-full w-full max-w-md bg-white p-6 shadow-2xl dark:bg-slate-900 overflow-y-auto flex flex-col justify-between border-l border-slate-200 dark:border-white/10">
              <div>
                <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-white/5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Propiedades de la Tarea</h3>
                  <button onClick={() => setTareaSeleccionada(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Título</label>
                    <input
                      className="input"
                      value={editTitulo}
                      onChange={(e) => setEditTitulo(e.target.value)}
                      disabled={!canEditTasks}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Descripción</label>
                    <textarea
                      className="input min-h-[100px]"
                      value={editDescripcion}
                      onChange={(e) => setEditDescripcion(e.target.value)}
                      disabled={!canEditTasks}
                      placeholder="Sin descripción..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Fecha Límite</label>
                      <input
                        type="date"
                        className="input"
                        value={editFechaLimite}
                        onChange={(e) => setEditFechaLimite(e.target.value)}
                        disabled={!canEditTasks}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Prioridad</label>
                      <select
                        className="input"
                        value={editPrioridad}
                        onChange={(e) => setEditPrioridad(e.target.value)}
                        disabled={!canEditTasks}
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Asignado a</label>
                    <select
                      className="input"
                      value={editAsignado}
                      onChange={(e) => setEditAsignado(e.target.value)}
                      disabled={!canEditTasks}
                    >
                      <option value="">Sin asignar</option>
                      <option value={p.id_usuario_creador}>
                        {p.creador?.nombres} {p.creador?.apellidos} (Creador)
                      </option>
                      {p.integrantes
                        .filter((i) => i.estado === "activo" && i.id_usuario !== p.id_usuario_creador)
                        .map((i) => (
                          <option key={i.id_integrante} value={i.id_usuario}>
                            {i.usuario.nombres} {i.usuario.apellidos} ({i.rol_en_proyecto})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Avance ({editAvance}%)</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      className="w-full accent-brand-600"
                      value={editAvance}
                      onChange={(e) => setEditAvance(Number(e.target.value))}
                      disabled={!canEditTasks}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-white/5">
                <button onClick={() => setTareaSeleccionada(null)} className="btn-secondary">
                  {canEditTasks ? "Cancelar" : "Cerrar"}
                </button>
                {canEditTasks && (
                  <button onClick={handleGuardarTarea} className="btn-primary">
                    Guardar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Proyectos grupales</h1>
          <p className="text-slate-500 dark:text-slate-400">Coordina a tu equipo y da seguimiento al avance.</p>
        </div>
        <button className="btn-primary" onClick={() => setModalProyectoAbierto(true)}>
          <Plus size={16} className="mr-1" /> Nuevo proyecto
        </button>
      </div>

      {cursoIdFiltro && (
        <div className="card flex items-center justify-between gap-3 bg-brand-50 text-sm text-brand-700 dark:bg-brand-500/10 dark:text-brand-200">
          <span>Mostrando proyectos de este curso</span>
          <button className="btn-secondary text-xs" onClick={() => router.push("/proyectos")}>
            Ver todos
          </button>
        </div>
      )}

      {/* Pending Invitations Section */}
      {invitaciones.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Invitaciones pendientes</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {invitaciones.map((p) => (
              <div key={p.id_proyecto} className="card border-amber-200 bg-amber-50/20 dark:border-amber-500/20 dark:bg-amber-500/5">
                <h3 className="font-semibold text-slate-900 dark:text-white">{p.nombre_proyecto}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{p.descripcion || "Sin descripción"}</p>
                <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                  Invitado por: <span className="font-medium text-slate-600 dark:text-slate-300">{p.creador?.nombres} {p.creador?.apellidos}</span>
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleAceptarInvitacion(p.id_proyecto)}
                    className="btn-primary flex-1 py-1.5 text-xs text-center"
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={() => handleRechazarInvitacion(p.id_proyecto)}
                    className="btn-secondary flex-1 py-1.5 text-xs text-center text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mis proyectos activos</h2>
        {cargando ? (
          <div className="card text-center text-slate-400 dark:text-slate-500">Cargando proyectos...</div>
        ) : proyectosVisibles.length === 0 ? (
          <div className="card text-center text-slate-400 dark:text-slate-500">Aún no tienes proyectos grupales activos.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {proyectosVisibles.map((p) => (
              <div
                key={p.id_proyecto}
                className="card cursor-pointer hover:shadow-md transition flex flex-col justify-between"
                onClick={() => setProyectoSeleccionado(p)}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{p.nombre_proyecto}</h3>
                      {p.estado_proyecto === "pausado" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300 font-bold uppercase">Pausado</span>
                      )}
                    </div>
                    {p.id_usuario_creador === currentUser?.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIdAEliminar(p.id_proyecto);
                        }}
                        className="text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{p.descripcion || "Sin descripción"}</p>
                </div>

                <div className="mt-4">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${p.avance_general}%` }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                    <span>{p.integrantes.length} integrante(s)</span>
                    <span>{p.avance_general}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalProyectoAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Nuevo proyecto</h3>
              <button onClick={() => setModalProyectoAbierto(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
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
