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
    <div className="card !p-0 overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
      <div className="p-6 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Usuarios registrados</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gestiona los estudiantes y su acceso a la plataforma.</p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <input
            className="input w-full pl-10 pr-4 py-2 bg-slate-50 border-slate-200 focus:bg-white dark:bg-slate-900/50 dark:border-white/10 focus:ring-2 focus:ring-brand-500/20"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 dark:bg-slate-900/50">
            <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Estudiante</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Universidad / Carrera</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Plan</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap text-center">Actividad</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Estado</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-slate-950">
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">No se encontraron usuarios que coincidan con la búsqueda.</td>
              </tr>
            ) : (
              filtrados.map((u) => (
                <tr key={u.id_usuario} className="group hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors duration-200">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500/20 to-brand-500/10 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold shadow-inner">
                        {u.nombres[0]}{u.apellidos[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{u.nombres} {u.apellidos}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{u.correo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {u.perfil_estudiante ? (
                      <div>
                        <p className="font-medium text-slate-700 dark:text-slate-300">{u.perfil_estudiante.universidad}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{u.perfil_estudiante.carrera}</p>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No especificado</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={clsx(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border",
                        u.suscripciones[0]?.plan.tipo_plan === "premium"
                          ? "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 shadow-sm"
                          : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-white/10"
                      )}
                    >
                      {u.suscripciones[0]?.plan.tipo_plan === "premium" && (
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l.707.707L15.828 2.5a1 1 0 111.414 1.414l-2.414 2.414 2.414 2.414a1 1 0 11-1.414 1.414L13.414 7.828l-2.414 2.414a1 1 0 11-1.414-1.414l2.414-2.414-2.414-2.414a1 1 0 010-1.414l2.414-2.414A1 1 0 0112 2z" clipRule="evenodd"></path></svg>
                      )}
                      {u.suscripciones[0]?.plan.nombre_plan ?? "Sin plan"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex flex-col items-center" title="Tareas">
                        <span className="text-xs text-slate-400">Tareas</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{u._count.tareas}</span>
                      </div>
                      <div className="h-6 w-px bg-slate-200 dark:bg-white/10"></div>
                      <div className="flex flex-col items-center" title="Proyectos">
                        <span className="text-xs text-slate-400">Proy.</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{u._count.proyectos_creados}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize", colorEstado[u.estado])}>
                      {u.estado === 'activo' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>}
                      {u.estado === 'inactivo' && <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>}
                      {u.estado === 'suspendido' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>}
                      {u.estado}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <select
                      className="input py-1.5 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-sm focus:border-brand-500 focus:ring-brand-500/20"
                      value={u.estado}
                      onChange={(e) => onCambiarEstado(u.id_usuario, e.target.value)}
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="suspendido">Suspendido</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
