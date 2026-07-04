import { prisma } from "@/lib/prisma";
import CardResumen from "@/components/CardResumen";
import { ListChecks, Clock3, CheckCircle2, AlertTriangle } from "lucide-react";

const colorEstado: Record<string, string> = { pendiente: "bg-slate-100 text-slate-600", en_progreso: "bg-blue-100 text-blue-700", completada: "bg-emerald-100 text-emerald-700", vencida: "bg-red-100 text-red-700" };

export default async function AdminTareasPage() {
  const tareas = await prisma.tarea.findMany({ include: { usuario: true, curso: true }, orderBy: { fecha_limite: "asc" } });
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tareas registradas</h1><p className="text-slate-500 dark:text-slate-400">Control global de tareas de la plataforma.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardResumen titulo="Total" valor={tareas.length} icon={ListChecks} color="brand" />
        <CardResumen titulo="Pendientes" valor={tareas.filter((t) => t.estado_tarea === "pendiente").length} icon={Clock3} color="amber" />
        <CardResumen titulo="Completadas" valor={tareas.filter((t) => t.estado_tarea === "completada").length} icon={CheckCircle2} color="green" />
        <CardResumen titulo="Vencidas" valor={tareas.filter((t) => t.estado_tarea === "vencida").length} icon={AlertTriangle} color="red" />
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead><tr className="border-b border-slate-200 text-slate-500"><th className="py-2 pr-4 font-medium">Usuario</th><th className="py-2 pr-4 font-medium">Curso</th><th className="py-2 pr-4 font-medium">Título</th><th className="py-2 pr-4 font-medium">Prioridad</th><th className="py-2 pr-4 font-medium">Estado</th><th className="py-2 pr-4 font-medium">Avance</th><th className="py-2 pr-4 font-medium">Fecha límite</th></tr></thead>
          <tbody>{tareas.map((t) => <tr key={t.id_tarea} className="border-b border-slate-100 last:border-0"><td className="py-2 pr-4 text-slate-900 dark:text-white">{t.usuario.nombres} {t.usuario.apellidos}</td><td className="py-2 pr-4 text-slate-500">{t.curso?.nombre_curso ?? "—"}</td><td className="py-2 pr-4 text-slate-500">{t.titulo}</td><td className="py-2 pr-4 text-slate-500">{t.prioridad}</td><td className="py-2 pr-4"><span className={`badge ${colorEstado[t.estado_tarea]}`}>{t.estado_tarea}</span></td><td className="py-2 pr-4 text-slate-500">{t.avance_porcentual}%</td><td className="py-2 pr-4 text-slate-500">{t.fecha_limite ? new Date(t.fecha_limite).toLocaleDateString("es-PE") : "—"}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
