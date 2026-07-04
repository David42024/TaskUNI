import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/session";
import { BadgeCheck, CalendarDays, Users } from "lucide-react";

const columnas = ["pendiente", "en_progreso", "completada", "vencida"] as const;

export default async function DetalleProyectoPage({ params }: { params: { id: string } }) {
  const user = await requireUsuario();
  const proyecto = await prisma.proyecto.findFirst({
    where: {
      id_proyecto: params.id,
      OR: [{ id_usuario_creador: user.id }, { integrantes: { some: { id_usuario: user.id } } }],
    },
    include: {
      creador: { select: { nombres: true, apellidos: true, correo: true } },
      curso: true,
      integrantes: { include: { usuario: { select: { nombres: true, apellidos: true, correo: true } } } },
      tareas: true,
      recordatorios: true,
    },
  });

  if (!proyecto) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{proyecto.nombre_proyecto}</h1>
          <p className="text-slate-500 dark:text-slate-400">{proyecto.descripcion}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/proyectos" className="btn-secondary">Volver</Link>
          <button className="btn-primary">Ver tablero</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card"><p className="text-xs text-slate-400">Curso</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{proyecto.curso?.nombre_curso ?? "—"}</p></div>
        <div className="card"><p className="text-xs text-slate-400">Creador</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{proyecto.creador.nombres} {proyecto.creador.apellidos}</p></div>
        <div className="card"><p className="text-xs text-slate-400">Estado</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{proyecto.estado_proyecto}</p></div>
        <div className="card"><p className="text-xs text-slate-400">Avance</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{proyecto.avance_general}%</p></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {columnas.map((columna) => (
            <div key={columna} className="card">
              <div className="mb-3 flex items-center gap-2">
                <h3 className="font-semibold text-slate-800 dark:text-white capitalize">{columna.replace("_", " ")}</h3>
                <span className="badge bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-300">{proyecto.tareas.filter((t) => t.estado === columna).length}</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {proyecto.tareas.filter((t) => t.estado === columna).map((tarea) => (
                  <div key={tarea.id_tarea_proyecto} className="rounded-2xl border border-slate-200 p-3 dark:border-white/10">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-900 dark:text-white">{tarea.titulo}</p>
                      <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">{tarea.prioridad}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{tarea.descripcion ?? "Sin descripción"}</p>
                    <p className="mt-2 text-xs text-slate-400">Avance {tarea.avance_porcentual}%</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="card">
            <h3 className="mb-3 font-semibold text-slate-800 dark:text-white">Integrantes</h3>
            <div className="space-y-2">
              {proyecto.integrantes.map((i) => (
                <div key={i.id_integrante} className="rounded-2xl border border-slate-200 p-3 dark:border-white/10">
                  <p className="font-medium text-slate-900 dark:text-white">{i.usuario.nombres} {i.usuario.apellidos}</p>
                  <p className="text-xs text-slate-400">{i.rol_en_proyecto} · {i.responsabilidad ?? "Sin responsabilidad"}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="mb-3 font-semibold text-slate-800 dark:text-white">Recordatorios</h3>
            {proyecto.recordatorios.length === 0 ? (
              <p className="text-sm text-slate-400">Sin recordatorios.</p>
            ) : (
              proyecto.recordatorios.map((r) => (
                <div key={r.id_recordatorio} className="mb-2 rounded-2xl border border-slate-200 p-3 dark:border-white/10">
                  <p className="font-medium text-slate-900 dark:text-white">{r.titulo}</p>
                  <p className="text-xs text-slate-400">{new Date(r.fecha_recordatorio).toLocaleDateString("es-PE")}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
