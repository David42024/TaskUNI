import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/session";
import CardResumen from "@/components/CardResumen";
import { BookOpen, ClipboardList, FolderKanban, GraduationCap } from "lucide-react";

export default async function CursosPage() {
  const user = await requireUsuario();

  const cursos = await prisma.curso.findMany({
    where: { id_usuario: user.id },
    include: { tareas: true, proyectos: true },
    orderBy: { nombre_curso: "asc" },
  });

  const totalTareas = cursos.reduce((sum, curso) => sum + curso.tareas.length, 0);
  const totalProyectos = cursos.reduce((sum, curso) => sum + curso.proyectos.length, 0);
  const promedioAvance = cursos.length
    ? Math.round(cursos.reduce((sum, curso) => sum + (curso.tareas.length ? curso.tareas.reduce((a, t) => a + t.avance_porcentual, 0) / curso.tareas.length : 0), 0) / cursos.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cursos</h1>
          <p className="text-slate-500 dark:text-slate-400">Tus asignaturas, docentes, tareas y proyectos asociados.</p>
        </div>
        <Link href="/tareas" className="btn-primary">Nuevo curso desde tareas</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardResumen titulo="Cursos activos" valor={cursos.length} icon={GraduationCap} color="brand" />
        <CardResumen titulo="Tareas asociadas" valor={totalTareas} icon={ClipboardList} color="green" />
        <CardResumen titulo="Proyectos asociados" valor={totalProyectos} icon={FolderKanban} color="amber" />
        <CardResumen titulo="Avance promedio" valor={`${promedioAvance}%`} icon={BookOpen} color="slate" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {cursos.map((curso) => (
          <div key={curso.id_curso} className="card space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{curso.nombre_curso}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{curso.docente ?? "Docente pendiente"}</p>
              </div>
              <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">{curso.ciclo ?? "Sin ciclo"}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
                <p className="text-xs text-slate-400">Tareas</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{curso.tareas.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
                <p className="text-xs text-slate-400">Proyectos</p>
                <p className="mt-1 font-semibold text-slate-900 dark:text-white">{curso.proyectos.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
                <p className="text-xs text-slate-400">Estado</p>
                <p className="mt-1 font-semibold text-emerald-600 dark:text-emerald-300">Activo</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/tareas?curso=${curso.id_curso}`} className="btn-secondary text-xs">Ver tareas</Link>
              <Link href={`/proyectos?curso=${curso.id_curso}`} className="btn-secondary text-xs">Ver proyectos</Link>
              <Link href={`/tareas?nuevo=1&curso=${curso.id_curso}`} className="btn-primary text-xs">Nueva tarea</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
