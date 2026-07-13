"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, X } from "lucide-react";
import TablaTareas, { TareaVista } from "@/components/TablaTareas";
import FormularioTarea, { DatosTarea } from "@/components/FormularioTarea";
import ModalConfirmacion from "@/components/ModalConfirmacion";

interface Curso {
  id_curso: string;
  nombre_curso: string;
}

export default function TareasPage() {
  return (
    <Suspense fallback={<div className="card text-center text-slate-400">Cargando tareas...</div>}>
      <TareasContenido />
    </Suspense>
  );
}

function TareasContenido() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cursoIdFiltro = searchParams.get("curso");
  const [tareas, setTareas] = useState<TareaVista[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [tareaEditando, setTareaEditando] = useState<TareaVista | null>(null);
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [nuevoCurso, setNuevoCurso] = useState("");
  const [mostrarNuevoCurso, setMostrarNuevoCurso] = useState(false);

  async function cargarDatos() {
    setCargando(true);
    const [resTareas, resCursos] = await Promise.all([fetch("/api/tareas"), fetch("/api/cursos")]);
    setTareas(await resTareas.json());
    setCursos(await resCursos.json());
    setCargando(false);
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function handleGuardar(datos: DatosTarea) {
    const esEdicion = Boolean(tareaEditando);
    const url = esEdicion ? `/api/tareas/${tareaEditando!.id_tarea}` : "/api/tareas";
    const res = await fetch(url, {
      method: esEdicion ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "No se pudo guardar la tarea");
    setModalAbierto(false);
    setTareaEditando(null);
    await cargarDatos();
  }

  async function handleEliminar() {
    if (!idAEliminar) return;
    setEliminando(true);
    await fetch(`/api/tareas/${idAEliminar}`, { method: "DELETE" });
    setEliminando(false);
    setIdAEliminar(null);
    await cargarDatos();
  }

  async function handleCrearCurso() {
    if (nuevoCurso.trim().length < 2) return;
    const res = await fetch("/api/cursos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre_curso: nuevoCurso }),
    });
    if (res.ok) {
      setNuevoCurso("");
      setMostrarNuevoCurso(false);
      await cargarDatos();
    }
  }

  const tareasVisibles = cursoIdFiltro ? tareas.filter((t) => t.id_curso === cursoIdFiltro) : tareas;
  const cursoFiltro = cursoIdFiltro ? cursos.find((c) => c.id_curso === cursoIdFiltro) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis tareas</h1>
          <p className="text-slate-500">Organiza tus actividades académicas por curso y prioridad.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setMostrarNuevoCurso(true)}>
            <Plus size={16} className="mr-1" /> Curso
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              setTareaEditando(null);
              setModalAbierto(true);
            }}
          >
            <Plus size={16} className="mr-1" /> Nueva tarea
          </button>
        </div>
      </div>

      {cursoIdFiltro && (
        <div className="card flex items-center justify-between gap-3 bg-brand-50 text-sm text-brand-700">
          <span>
            Mostrando tareas de <strong>{cursoFiltro?.nombre_curso ?? "este curso"}</strong>
          </span>
          <button className="btn-secondary text-xs" onClick={() => router.push("/tareas")}>
            Ver todas
          </button>
        </div>
      )}

      {mostrarNuevoCurso && (
        <div className="card flex items-center gap-3">
          <input
            className="input"
            placeholder="Nombre del curso, ej. Redes y Comunicaciones I"
            value={nuevoCurso}
            onChange={(e) => setNuevoCurso(e.target.value)}
          />
          <button className="btn-primary" onClick={handleCrearCurso}>
            Guardar
          </button>
          <button className="btn-secondary" onClick={() => setMostrarNuevoCurso(false)}>
            <X size={16} />
          </button>
        </div>
      )}

      {cargando ? (
        <div className="card text-center text-slate-400">Cargando tareas...</div>
      ) : (
        <TablaTareas
          tareas={tareasVisibles}
          onEditar={(t) => {
            setTareaEditando(t);
            setModalAbierto(true);
          }}
          onEliminar={(id) => setIdAEliminar(id)}
        />
      )}

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                {tareaEditando ? "Editar tarea" : "Nueva tarea"}
              </h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <FormularioTarea
              cursos={cursos}
              valoresIniciales={tareaEditando ?? undefined}
              onGuardar={handleGuardar}
              onCancelar={() => setModalAbierto(false)}
            />
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
