import { prisma } from "@/lib/prisma";
import CardResumen from "@/components/CardResumen";
import { FolderKanban, Users, CheckCircle2, Clock3 } from "lucide-react";

export default async function AdminProyectosPage() {
  const proyectos = await prisma.proyecto.findMany({ include: { creador: true, curso: true, integrantes: true, tareas: true }, orderBy: { fecha_creacion: "desc" } });
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Proyectos registrados</h1><p className="text-slate-500 dark:text-slate-400">Visibilidad de proyectos y equipos.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardResumen titulo="Total" valor={proyectos.length} icon={FolderKanban} color="brand" />
        <CardResumen titulo="En progreso" valor={proyectos.filter((p) => p.estado_proyecto === "en_progreso").length} icon={Clock3} color="amber" />
        <CardResumen titulo="Completados" valor={proyectos.filter((p) => p.estado_proyecto === "completado").length} icon={CheckCircle2} color="green" />
        <CardResumen titulo="Integrantes" valor={proyectos.reduce((a, p) => a + p.integrantes.length, 0)} icon={Users} color="slate" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {proyectos.map((p) => (
          <div key={p.id_proyecto} className="card space-y-2">
            <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900 dark:text-white">{p.nombre_proyecto}</h3><p className="text-xs text-slate-400">{p.creador.nombres} {p.creador.apellidos}</p></div><span className="badge bg-brand-100 text-brand-700">{p.estado_proyecto}</span></div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{p.curso?.nombre_curso ?? "Sin curso"}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Integrantes: {p.integrantes.length} · Tareas internas: {p.tareas.length}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
