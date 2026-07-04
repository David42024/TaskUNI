import Link from "next/link";
import CardResumen from "@/components/CardResumen";
import { getAdminOverview, formatMoney } from "@/lib/taskuni-data";
import { BarChart3, Users, UserCheck, Crown, ListChecks, FolderKanban, LifeBuoy, DollarSign } from "lucide-react";

export default async function AdminDashboardPage() {
  const m = await getAdminOverview();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard administrativo</h1>
        <p className="text-slate-500 dark:text-slate-400">Panorama general del e-Business TaskUni.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardResumen titulo="Usuarios" valor={m.totalUsuarios} icon={Users} color="brand" />
        <CardResumen titulo="Estudiantes" valor={m.totalEstudiantes} icon={UserCheck} color="green" />
        <CardResumen titulo="Premium" valor={m.usuariosPremium} icon={Crown} color="amber" />
        <CardResumen titulo="Ingresos" valor={formatMoney(m.ingresosEstimados)} icon={DollarSign} color="slate" />
        <CardResumen titulo="Tareas" valor={m.totalTareas} icon={ListChecks} color="brand" />
        <CardResumen titulo="Proyectos" valor={m.totalProyectos} icon={FolderKanban} color="brand" />
        <CardResumen titulo="Consultas pendientes" valor={m.consultasPendientes} icon={LifeBuoy} color="red" />
        <CardResumen titulo="Crecimiento" valor={`${Math.max(0, m.totalUsuarios - 3)} registros`} icon={BarChart3} color="green" />
      </div>

      <div className="card flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Reportes administrativos</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Genera reportes de usuarios, pagos, uso académico, soporte y operación del e-Business.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/reportes" className="btn-secondary">
            Ir a reportes
          </Link>
          <Link href="/admin/reportes?tipo=ejecutivo" className="btn-primary">
            Generar reporte
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-3 font-semibold text-slate-800 dark:text-white">Usuarios recientes</h3>
          <div className="space-y-3">
            {m.usuariosRecientes.map((u) => (
              <div key={u.id_usuario} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3 dark:border-white/10">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{u.nombres} {u.apellidos}</p>
                  <p className="text-xs text-slate-400">{u.correo}</p>
                </div>
                <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">{u.rol}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="mb-3 font-semibold text-slate-800 dark:text-white">Consultas pendientes</h3>
          <div className="space-y-3">
            {m.consultasRecientes.slice(0, 6).map((c) => (
              <div key={c.id_consulta} className="rounded-2xl border border-slate-200 p-3 dark:border-white/10">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-900 dark:text-white">{c.asunto}</p>
                  <span className="badge bg-amber-100 text-amber-700">{c.estado_consulta}</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{c.usuario.nombres} {c.usuario.apellidos}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
