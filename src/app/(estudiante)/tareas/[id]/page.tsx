import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/session";
import { BadgeCheck, Clock3, Pencil, Trash2 } from "lucide-react";

const estadoColor: Record<string, string> = {
  pendiente: "bg-slate-100 text-slate-600",
  en_progreso: "bg-blue-100 text-blue-700",
  completada: "bg-emerald-100 text-emerald-700",
  vencida: "bg-red-100 text-red-700",
};

export default async function DetalleTareaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUsuario();
  const tarea = await prisma.tarea.findFirst({
    where: { id_tarea: id, id_usuario: user.id },
    include: { curso: true, recordatorios: true },
  });

  if (!tarea) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{tarea.titulo}</h1>
          <p className="text-slate-500 dark:text-slate-400">{tarea.descripcion ?? "Sin descripción"}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/tareas?nuevo=1&editar=${tarea.id_tarea}`} className="btn-secondary">Editar</Link>
          <button className="btn-secondary">Eliminar</button>
          <button className="btn-primary flex items-center gap-2"><BadgeCheck size={16} /> Completar</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="card"><p className="text-xs text-slate-400">Curso</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{tarea.curso?.nombre_curso ?? "—"}</p></div>
        <div className="card"><p className="text-xs text-slate-400">Estado</p><span className={`mt-1 inline-flex badge ${estadoColor[tarea.estado_tarea]}`}>{tarea.estado_tarea}</span></div>
        <div className="card"><p className="text-xs text-slate-400">Prioridad</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{tarea.prioridad}</p></div>
        <div className="card"><p className="text-xs text-slate-400">Avance</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{tarea.avance_porcentual}%</p></div>
      </div>

      <div className="card grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs text-slate-400">Fecha límite</p>
          <p className="mt-1 font-semibold text-slate-900 dark:text-white">{tarea.fecha_limite ? new Date(tarea.fecha_limite).toLocaleDateString("es-PE") : "Sin fecha"}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Fecha de creación</p>
          <p className="mt-1 font-semibold text-slate-900 dark:text-white">{new Date(tarea.fecha_creacion).toLocaleDateString("es-PE")}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Última actualización</p>
          <p className="mt-1 font-semibold text-slate-900 dark:text-white">{new Date(tarea.fecha_actualizacion).toLocaleDateString("es-PE")}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Recordatorios asociados</p>
          <p className="mt-1 font-semibold text-slate-900 dark:text-white">{tarea.recordatorios.length}</p>
        </div>
      </div>

      <div className="card space-y-3">
        <h3 className="font-semibold text-slate-800 dark:text-white">Recordatorios</h3>
        {tarea.recordatorios.length === 0 ? (
          <p className="text-sm text-slate-400">No hay recordatorios asociados.</p>
        ) : (
          tarea.recordatorios.map((r) => (
            <div key={r.id_recordatorio} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3 dark:border-white/10">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{r.titulo}</p>
                <p className="text-xs text-slate-400">{new Date(r.fecha_recordatorio).toLocaleDateString("es-PE")}</p>
              </div>
              <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">{r.estado}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
