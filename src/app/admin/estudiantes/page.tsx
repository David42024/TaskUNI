"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { GraduationCap, ClipboardList, FolderKanban, Crown, Pencil, Trash2, X } from "lucide-react";
import CardResumen from "@/components/CardResumen";
import ModalConfirmacion from "@/components/ModalConfirmacion";

interface Estudiante {
  id_usuario: string;
  nombres: string;
  apellidos: string;
  correo: string;
  estado: "activo" | "inactivo" | "suspendido";
  perfil_estudiante: {
    universidad: string;
    carrera: string;
    ciclo_academico: string;
    codigo_estudiante: string | null;
  } | null;
  suscripciones: { plan: { nombre_plan: string; tipo_plan: string } }[];
  _count: { tareas: number; proyectos_creados: number };
}

interface DatosEdicion {
  nombres: string;
  apellidos: string;
  estado: string;
  universidad: string;
  carrera: string;
  ciclo_academico: string;
  codigo_estudiante: string;
}

const colorEstado: Record<string, string> = {
  activo: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
  inactivo: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200",
  suspendido: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200",
};

export default function AdminEstudiantesPage() {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroPlan, setFiltroPlan] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [editando, setEditando] = useState<Estudiante | null>(null);
  const [datos, setDatos] = useState<DatosEdicion | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      const res = await fetch("/api/admin/estudiantes");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setEstudiantes(data);
      } else {
        setEstudiantes([]);
      }
    } catch {
      setEstudiantes([]);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return estudiantes.filter((u) => {
      const plan = u.suscripciones[0]?.plan.tipo_plan ?? "sin_plan";
      const coincideBusqueda =
        !q ||
        `${u.nombres} ${u.apellidos}`.toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q) ||
        u.perfil_estudiante?.universidad.toLowerCase().includes(q) ||
        u.perfil_estudiante?.carrera.toLowerCase().includes(q);
      const coincidePlan = filtroPlan === "todos" || plan === filtroPlan;
      const coincideEstado = filtroEstado === "todos" || u.estado === filtroEstado;
      return coincideBusqueda && coincidePlan && coincideEstado;
    });
  }, [estudiantes, busqueda, filtroPlan, filtroEstado]);

  const premium = estudiantes.filter((u) => u.suscripciones[0]?.plan.tipo_plan === "premium").length;

  function abrirEdicion(u: Estudiante) {
    setEditando(u);
    setError("");
    setDatos({
      nombres: u.nombres,
      apellidos: u.apellidos,
      estado: u.estado,
      universidad: u.perfil_estudiante?.universidad ?? "",
      carrera: u.perfil_estudiante?.carrera ?? "",
      ciclo_academico: u.perfil_estudiante?.ciclo_academico ?? "",
      codigo_estudiante: u.perfil_estudiante?.codigo_estudiante ?? "",
    });
  }

  async function handleGuardar(e: React.FormEvent) {
    e.preventDefault();
    if (!editando || !datos) return;
    setError("");
    setGuardando(true);
    try {
      const res = await fetch(`/api/admin/estudiantes/${editando.id_usuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombres: datos.nombres,
          apellidos: datos.apellidos,
          estado: datos.estado,
          perfil: {
            universidad: datos.universidad,
            carrera: datos.carrera,
            ciclo_academico: datos.ciclo_academico,
            codigo_estudiante: datos.codigo_estudiante,
          },
        }),
      });
      const respuesta = await res.json();
      if (!res.ok) throw new Error(respuesta.error || "No se pudo guardar el estudiante");
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
    await fetch(`/api/admin/estudiantes/${idAEliminar}`, { method: "DELETE" });
    setEliminando(false);
    setIdAEliminar(null);
    await cargar();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Estudiantes</h1>
        <p className="text-slate-500 dark:text-slate-400">Vista académica consolidada por usuario.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardResumen titulo="Estudiantes" valor={estudiantes.length} icon={GraduationCap} color="brand" />
        <CardResumen titulo="Premium" valor={premium} icon={Crown} color="amber" />
        <CardResumen titulo="Tareas" valor={estudiantes.reduce((a, u) => a + u._count.tareas, 0)} icon={ClipboardList} color="green" />
        <CardResumen titulo="Proyectos" valor={estudiantes.reduce((a, u) => a + u._count.proyectos_creados, 0)} icon={FolderKanban} color="slate" />
      </div>

      <div className="card space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="input max-w-xs"
            placeholder="Buscar por nombre, correo, universidad o carrera..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select className="input max-w-[180px]" value={filtroPlan} onChange={(e) => setFiltroPlan(e.target.value)}>
            <option value="todos">Todos los planes</option>
            <option value="premium">Premium</option>
            <option value="gratuito">Gratuito</option>
            <option value="sin_plan">Sin plan</option>
          </select>
          <select className="input max-w-[180px]" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="suspendido">Suspendido</option>
          </select>
          <span className="text-xs text-slate-400">{filtrados.length} de {estudiantes.length} estudiante(s)</span>
        </div>

        {cargando ? (
          <p className="text-center text-slate-400">Cargando estudiantes...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-400">
                  <th className="py-2 pr-4 font-medium">Nombre</th>
                  <th className="py-2 pr-4 font-medium">Correo</th>
                  <th className="py-2 pr-4 font-medium">Universidad</th>
                  <th className="py-2 pr-4 font-medium">Carrera</th>
                  <th className="py-2 pr-4 font-medium">Ciclo</th>
                  <th className="py-2 pr-4 font-medium">Plan</th>
                  <th className="py-2 pr-4 font-medium">Tareas</th>
                  <th className="py-2 pr-4 font-medium">Proyectos</th>
                  <th className="py-2 pr-4 font-medium">Estado</th>
                  <th className="py-2 pr-4 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((u) => (
                  <tr key={u.id_usuario} className="border-b border-slate-100 last:border-0 dark:border-white/5">
                    <td className="py-2 pr-4 font-medium text-slate-900 dark:text-white">{u.nombres} {u.apellidos}</td>
                    <td className="py-2 pr-4 text-slate-500">{u.correo}</td>
                    <td className="py-2 pr-4 text-slate-500">{u.perfil_estudiante?.universidad ?? "—"}</td>
                    <td className="py-2 pr-4 text-slate-500">{u.perfil_estudiante?.carrera ?? "—"}</td>
                    <td className="py-2 pr-4 text-slate-500">{u.perfil_estudiante?.ciclo_academico ?? "—"}</td>
                    <td className="py-2 pr-4">
                      <span className="badge bg-brand-100 text-brand-700">{u.suscripciones[0]?.plan.nombre_plan ?? "Sin plan"}</span>
                    </td>
                    <td className="py-2 pr-4 text-slate-500">{u._count.tareas}</td>
                    <td className="py-2 pr-4 text-slate-500">{u._count.proyectos_creados}</td>
                    <td className="py-2 pr-4">
                      <span className={clsx("badge capitalize", colorEstado[u.estado])}>{u.estado}</span>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => abrirEdicion(u)} className="text-slate-400 hover:text-brand-600" title="Editar">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => setIdAEliminar(u.id_usuario)} className="text-slate-400 hover:text-red-500" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-6 text-center text-slate-400">
                      No se encontraron estudiantes con esos filtros.
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
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Editar estudiante</h3>
              <button onClick={() => setEditando(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleGuardar} className="space-y-4">
              {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Nombres</label>
                  <input className="input" value={datos.nombres} onChange={(e) => setDatos({ ...datos, nombres: e.target.value })} />
                </div>
                <div>
                  <label className="label">Apellidos</label>
                  <input className="input" value={datos.apellidos} onChange={(e) => setDatos({ ...datos, apellidos: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Universidad</label>
                  <input className="input" value={datos.universidad} onChange={(e) => setDatos({ ...datos, universidad: e.target.value })} />
                </div>
                <div>
                  <label className="label">Carrera</label>
                  <input className="input" value={datos.carrera} onChange={(e) => setDatos({ ...datos, carrera: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Ciclo académico</label>
                  <input className="input" value={datos.ciclo_academico} onChange={(e) => setDatos({ ...datos, ciclo_academico: e.target.value })} />
                </div>
                <div>
                  <label className="label">Código de estudiante</label>
                  <input className="input" value={datos.codigo_estudiante} onChange={(e) => setDatos({ ...datos, codigo_estudiante: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Estado</label>
                <select className="input" value={datos.estado} onChange={(e) => setDatos({ ...datos, estado: e.target.value })}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="suspendido">Suspendido</option>
                </select>
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
        titulo="Eliminar estudiante"
        mensaje="Se eliminará la cuenta del estudiante junto con sus tareas, proyectos creados y datos asociados. Esta acción no se puede deshacer."
        onConfirmar={handleEliminar}
        onCancelar={() => setIdAEliminar(null)}
        cargando={eliminando}
      />
    </div>
  );
}
