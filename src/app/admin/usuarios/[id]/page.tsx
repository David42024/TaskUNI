import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/taskuni-data";

export default async function AdminUsuarioDetallePage({ params }: { params: { id: string } }) {
  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario: params.id },
    include: {
      perfil_estudiante: true,
      suscripciones: { include: { plan: true }, orderBy: { fecha_inicio: "desc" } },
      cursos: true,
      tareas: true,
      proyectos_creados: { include: { curso: true } },
      integraciones: { include: { proyecto: true } },
      consultas_soporte: true,
      reportes: true,
      pagos: { include: { suscripcion: { include: { plan: true } } }, orderBy: { fecha_pago: "desc" } },
    },
  });

  if (!usuario) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Detalle de usuario</h1>
          <p className="text-slate-500 dark:text-slate-400">{usuario.nombres} {usuario.apellidos}</p>
        </div>
        <Link href="/admin/usuarios" className="btn-secondary">Volver</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card"><p className="text-xs text-slate-400">Correo</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{usuario.correo}</p></div>
        <div className="card"><p className="text-xs text-slate-400">Rol</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{usuario.rol}</p></div>
        <div className="card"><p className="text-xs text-slate-400">Estado</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{usuario.estado}</p></div>
        <div className="card"><p className="text-xs text-slate-400">Último acceso</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{usuario.ultimo_acceso ? new Date(usuario.ultimo_acceso).toLocaleString("es-PE") : "Sin acceso"}</p></div>
      </div>

      {usuario.perfil_estudiante && (
        <div className="card grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div><p className="text-xs text-slate-400">Universidad</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{usuario.perfil_estudiante.universidad}</p></div>
          <div><p className="text-xs text-slate-400">Carrera</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{usuario.perfil_estudiante.carrera}</p></div>
          <div><p className="text-xs text-slate-400">Ciclo</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{usuario.perfil_estudiante.ciclo_academico}</p></div>
          <div><p className="text-xs text-slate-400">Código</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{usuario.perfil_estudiante.codigo_estudiante ?? "—"}</p></div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card"><h3 className="mb-3 font-semibold text-slate-800 dark:text-white">Suscripciones</h3>{usuario.suscripciones.map((s) => <div key={s.id_suscripcion} className="mb-2 rounded-2xl border border-slate-200 p-3 dark:border-white/10"><p className="font-medium text-slate-900 dark:text-white">{s.plan.nombre_plan}</p><p className="text-xs text-slate-400">{s.estado_suscripcion} · {new Date(s.fecha_inicio).toLocaleDateString("es-PE")}</p></div>)}</div>
        <div className="card"><h3 className="mb-3 font-semibold text-slate-800 dark:text-white">Pagos</h3>{usuario.pagos.map((p) => <div key={p.id_pago} className="mb-2 rounded-2xl border border-slate-200 p-3 dark:border-white/10"><p className="font-medium text-slate-900 dark:text-white">{formatMoney(p.monto)} · {p.metodo_pago}</p><p className="text-xs text-slate-400">{p.estado_pago} · {new Date(p.fecha_pago).toLocaleDateString("es-PE")}</p></div>)}</div>
      </div>
    </div>
  );
}
