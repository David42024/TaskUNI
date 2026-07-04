import { prisma } from "@/lib/prisma";
import CardResumen from "@/components/CardResumen";
import { Users, UserCheck, Crown, ListChecks, FolderKanban, LifeBuoy, DollarSign } from "lucide-react";

async function obtenerMetricas() {
  const [
    totalUsuarios,
    usuariosActivos,
    usuariosPremium,
    usuariosGratuitos,
    totalTareas,
    totalProyectos,
    consultasPendientes,
    pagosAprobados,
    usuariosRecientes,
  ] = await Promise.all([
    prisma.usuario.count({ where: { rol: "estudiante" } }),
    prisma.usuario.count({ where: { rol: "estudiante", estado: "activo" } }),
    prisma.suscripcion.count({ where: { estado_suscripcion: "activa", plan: { tipo_plan: "premium" } } }),
    prisma.suscripcion.count({ where: { estado_suscripcion: "activa", plan: { tipo_plan: "gratuito" } } }),
    prisma.tarea.count(),
    prisma.proyecto.count(),
    prisma.consultaSoporte.count({ where: { estado_consulta: "pendiente" } }),
    prisma.pago.findMany({ where: { estado_pago: "aprobado" }, select: { monto: true } }),
    prisma.usuario.findMany({
      where: { rol: "estudiante" },
      orderBy: { fecha_registro: "desc" },
      take: 5,
      include: { perfil_estudiante: true },
    }),
  ]);

  const ingresosEstimados = pagosAprobados.reduce((acc, p) => acc + Number(p.monto), 0);

  return {
    totalUsuarios,
    usuariosActivos,
    usuariosPremium,
    usuariosGratuitos,
    totalTareas,
    totalProyectos,
    consultasPendientes,
    ingresosEstimados,
    usuariosRecientes,
  };
}

export default async function AdminDashboard() {
  const m = await obtenerMetricas();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel administrativo</h1>
        <p className="text-slate-500">Vista general de la operación del e-Business TaskUni.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CardResumen titulo="Usuarios registrados" valor={m.totalUsuarios} icon={Users} color="brand" />
        <CardResumen titulo="Usuarios activos" valor={m.usuariosActivos} icon={UserCheck} color="green" />
        <CardResumen titulo="Usuarios Premium" valor={m.usuariosPremium} icon={Crown} color="amber" />
        <CardResumen titulo="Usuarios gratuitos" valor={m.usuariosGratuitos} icon={Users} color="slate" />
        <CardResumen titulo="Tareas creadas" valor={m.totalTareas} icon={ListChecks} color="brand" />
        <CardResumen titulo="Proyectos creados" valor={m.totalProyectos} icon={FolderKanban} color="brand" />
        <CardResumen titulo="Consultas pendientes" valor={m.consultasPendientes} icon={LifeBuoy} color="red" />
        <CardResumen
          titulo="Ingresos estimados"
          valor={`S/ ${m.ingresosEstimados.toFixed(2)}`}
          icon={DollarSign}
          color="green"
        />
      </div>

      <div className="card">
        <h3 className="mb-3 font-semibold text-slate-800">Usuarios recientes</h3>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2 pr-4 font-medium">Nombre</th>
              <th className="py-2 pr-4 font-medium">Correo</th>
              <th className="py-2 pr-4 font-medium">Universidad</th>
              <th className="py-2 pr-4 font-medium">Fecha de registro</th>
            </tr>
          </thead>
          <tbody>
            {m.usuariosRecientes.map((u) => (
              <tr key={u.id_usuario} className="border-b border-slate-100 last:border-0">
                <td className="py-2 pr-4 font-medium text-slate-800">
                  {u.nombres} {u.apellidos}
                </td>
                <td className="py-2 pr-4 text-slate-500">{u.correo}</td>
                <td className="py-2 pr-4 text-slate-500">{u.perfil_estudiante?.universidad ?? "—"}</td>
                <td className="py-2 pr-4 text-slate-500">
                  {u.fecha_registro.toLocaleDateString("es-PE")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
