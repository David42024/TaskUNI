import { prisma } from "@/lib/prisma";
import CardResumen from "@/components/CardResumen";
import { GraduationCap, ClipboardList, FolderKanban, Crown } from "lucide-react";

export default async function AdminEstudiantesPage() {
  const estudiantes = await prisma.usuario.findMany({
    where: { rol: "estudiante" },
    include: { perfil_estudiante: true, suscripciones: { include: { plan: true }, take: 1, orderBy: { fecha_inicio: "desc" } }, _count: { select: { tareas: true, proyectos_creados: true } } },
    orderBy: { fecha_registro: "desc" },
  });

  const premium = estudiantes.filter((u) => u.suscripciones[0]?.plan.tipo_plan === "premium").length;

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

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead><tr className="border-b border-slate-200 text-slate-500"><th className="py-2 pr-4 font-medium">Nombre</th><th className="py-2 pr-4 font-medium">Correo</th><th className="py-2 pr-4 font-medium">Universidad</th><th className="py-2 pr-4 font-medium">Carrera</th><th className="py-2 pr-4 font-medium">Ciclo</th><th className="py-2 pr-4 font-medium">Plan</th><th className="py-2 pr-4 font-medium">Tareas</th><th className="py-2 pr-4 font-medium">Proyectos</th></tr></thead>
          <tbody>
            {estudiantes.map((u) => (
              <tr key={u.id_usuario} className="border-b border-slate-100 last:border-0">
                <td className="py-2 pr-4 font-medium text-slate-900 dark:text-white">{u.nombres} {u.apellidos}</td>
                <td className="py-2 pr-4 text-slate-500">{u.correo}</td>
                <td className="py-2 pr-4 text-slate-500">{u.perfil_estudiante?.universidad ?? "—"}</td>
                <td className="py-2 pr-4 text-slate-500">{u.perfil_estudiante?.carrera ?? "—"}</td>
                <td className="py-2 pr-4 text-slate-500">{u.perfil_estudiante?.ciclo_academico ?? "—"}</td>
                <td className="py-2 pr-4"><span className="badge bg-brand-100 text-brand-700">{u.suscripciones[0]?.plan.nombre_plan ?? "Sin plan"}</span></td>
                <td className="py-2 pr-4 text-slate-500">{u._count.tareas}</td>
                <td className="py-2 pr-4 text-slate-500">{u._count.proyectos_creados}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
