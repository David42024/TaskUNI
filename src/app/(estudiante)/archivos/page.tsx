import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/session";
import { FileText, Folder, Cloud } from "lucide-react";

export default async function ArchivosPage() {
  const user = await requireUsuario();
  const [cursos, proyectos] = await Promise.all([
    prisma.curso.findMany({ where: { id_usuario: user.id }, orderBy: { nombre_curso: "asc" } }),
    prisma.proyecto.findMany({
      where: { OR: [{ id_usuario_creador: user.id }, { integrantes: { some: { id_usuario: user.id } } }] },
      include: { curso: true },
      orderBy: { fecha_creacion: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Archivos académicos</h1>
        <p className="text-slate-500 dark:text-slate-400">Materiales, recursos y documentación vinculada a tus cursos y proyectos.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card"><p className="text-xs text-slate-400">Cursos</p><p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{cursos.length}</p></div>
        <div className="card"><p className="text-xs text-slate-400">Proyectos</p><p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{proyectos.length}</p></div>
        <div className="card"><p className="text-xs text-slate-400">Recursos en nube</p><p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{cursos.length + proyectos.length}</p></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card space-y-3">
          <h3 className="font-semibold text-slate-800 dark:text-white">Recursos por curso</h3>
          {cursos.map((curso) => (
            <div key={curso.id_curso} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 dark:border-white/10">
              <FileText className="text-brand-600" size={18} />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{curso.nombre_curso}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{curso.docente ?? "Docente pendiente"}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="card space-y-3">
          <h3 className="font-semibold text-slate-800 dark:text-white">Documentación de proyectos</h3>
          {proyectos.map((proyecto) => (
            <div key={proyecto.id_proyecto} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 dark:border-white/10">
              <Folder className="text-violet-600" size={18} />
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{proyecto.nombre_proyecto}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{proyecto.curso?.nombre_curso ?? "Sin curso"}</p>
              </div>
            </div>
          ))}
          <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
            <Cloud className="mb-2 text-brand-600" size={18} />
            Espacio preparado para subir recursos en nube cuando se conecte almacenamiento externo.
          </div>
        </div>
      </div>
    </div>
  );
}
