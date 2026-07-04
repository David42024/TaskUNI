"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";

export interface UsuarioVista {
  id_usuario: string;
  nombres: string;
  apellidos: string;
  correo: string;
  rol: "estudiante" | "administrador";
  estado: "activo" | "inactivo" | "suspendido";
  fecha_registro: string;
  perfil_estudiante?: { universidad: string; carrera: string; ciclo_academico: string } | null;
  suscripciones: { plan: { nombre_plan: string; tipo_plan: string } }[];
  _count: { tareas: number; proyectos_creados: number };
}

interface Props {
  usuarios: UsuarioVista[];
  onCambiarEstado: (id_usuario: string, estado: string) => void;
}

const colorEstado: Record<string, string> = {
  activo: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200",
  inactivo: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-200",
  suspendido: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200",
};

export default function TablaUsuarios({ usuarios, onCambiarEstado }: Props) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    if (!busqueda) return usuarios;
    const q = busqueda.toLowerCase();
    return usuarios.filter(
      (u) =>
        u.nombres.toLowerCase().includes(q) ||
        u.apellidos.toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q)
    );
  }, [usuarios, busqueda]);

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Usuarios registrados</h3>
        <input
          className="input max-w-xs"
          placeholder="Buscar por nombre o correo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-400">
              <th className="py-2 pr-4 font-medium">Estudiante</th>
              <th className="py-2 pr-4 font-medium">Universidad / Carrera</th>
              <th className="py-2 pr-4 font-medium">Plan</th>
              <th className="py-2 pr-4 font-medium">Tareas</th>
              <th className="py-2 pr-4 font-medium">Proyectos</th>
              <th className="py-2 pr-4 font-medium">Estado</th>
              <th className="py-2 pr-4 font-medium text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((u) => (
              <tr key={u.id_usuario} className="border-b border-slate-100 last:border-0">
                <td className="py-3 pr-4">
                  <p className="font-medium text-slate-800 dark:text-white">{u.nombres} {u.apellidos}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{u.correo}</p>
                </td>
                <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">
                  {u.perfil_estudiante
                    ? `${u.perfil_estudiante.universidad} — ${u.perfil_estudiante.carrera}`
                    : "—"}
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={clsx(
                      "badge",
                      u.suscripciones[0]?.plan.tipo_plan === "premium"
                        ? "bg-brand-100 text-brand-700"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {u.suscripciones[0]?.plan.nombre_plan ?? "Sin plan"}
                  </span>
                </td>
                <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{u._count.tareas}</td>
                <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{u._count.proyectos_creados}</td>
                <td className="py-3 pr-4">
                  <span className={clsx("badge capitalize", colorEstado[u.estado])}>{u.estado}</span>
                </td>
                <td className="py-3 pr-4 text-right">
                  <select
                    className="input py-1 text-xs"
                    value={u.estado}
                    onChange={(e) => onCambiarEstado(u.id_usuario, e.target.value)}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="suspendido">Suspendido</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
