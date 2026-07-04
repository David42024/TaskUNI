import { getAdminOverview, formatMoney } from "@/lib/taskuni-data";
import { getSesionActual } from "@/lib/session";
import AdminReportesPanel from "@/components/AdminReportesPanel";
import CardResumen from "@/components/CardResumen";
import { Crown, DollarSign, LifeBuoy, Users } from "lucide-react";

export default async function AdminReportesPage() {
  const session = await getSesionActual();
  const overview = await getAdminOverview();
  const generadoEn = new Date().toISOString();

  const data = {
    usuarios: overview.usuarios.map((usuario) => ({
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      rol: usuario.rol,
      estado: usuario.estado,
      fecha_registro: usuario.fecha_registro.toISOString(),
      plan: usuario.suscripciones?.[0]?.plan.nombre_plan ?? "Sin plan",
    })),
    suscripciones: overview.suscripciones.map((suscripcion) => ({
      usuario: `${suscripcion.usuario.nombres} ${suscripcion.usuario.apellidos}`,
      plan: suscripcion.plan.nombre_plan,
      tipo_plan: suscripcion.plan.tipo_plan,
      estado_suscripcion: suscripcion.estado_suscripcion,
      fecha_inicio: suscripcion.fecha_inicio.toISOString(),
    })),
    pagos: overview.pagos.map((pago) => ({
      usuario: `${pago.usuario.nombres} ${pago.usuario.apellidos}`,
      plan: pago.suscripcion.plan.nombre_plan,
      monto: Number(pago.monto),
      metodo_pago: pago.metodo_pago,
      estado_pago: pago.estado_pago,
      fecha_pago: pago.fecha_pago.toISOString(),
    })),
    tareas: overview.tareas.map((tarea) => ({
      titulo: tarea.titulo,
      estado_tarea: tarea.estado_tarea,
      prioridad: tarea.prioridad,
      usuario: `${tarea.usuario.nombres} ${tarea.usuario.apellidos}`,
      curso: tarea.curso?.nombre_curso ?? "—",
      fecha_limite: tarea.fecha_limite?.toISOString() ?? null,
    })),
    proyectos: overview.proyectos.map((proyecto) => ({
      nombre_proyecto: proyecto.nombre_proyecto,
      estado_proyecto: proyecto.estado_proyecto,
      creador: `${proyecto.creador.nombres} ${proyecto.creador.apellidos}`,
      curso: proyecto.curso?.nombre_curso ?? "—",
      integrantes: proyecto.integrantes.length,
      tareas: proyecto.tareas.length,
      fecha_creacion: proyecto.fecha_creacion.toISOString(),
    })),
    cursos: overview.cursos.map((curso) => ({
      nombre_curso: curso.nombre_curso,
      docente: curso.docente ?? "—",
      usuario: `${curso.usuario.nombres} ${curso.usuario.apellidos}`,
      estado: curso.estado,
    })),
    soporte: overview.soporte.map((consulta) => ({
      asunto: consulta.asunto,
      estado_consulta: consulta.estado_consulta,
      usuario: `${consulta.usuario.nombres} ${consulta.usuario.apellidos}`,
      fecha_envio: consulta.fecha_envio.toISOString(),
    })),
    reportes: overview.reportes.map((reporte) => ({
      periodo: reporte.periodo,
      porcentaje_cumplimiento: reporte.porcentaje_cumplimiento,
      racha_productividad: reporte.racha_productividad,
      total_tareas: reporte.total_tareas,
      tareas_completadas: reporte.tareas_completadas,
      tareas_pendientes: reporte.tareas_pendientes,
      tareas_vencidas: reporte.tareas_vencidas,
      fecha_generacion: reporte.fecha_generacion.toISOString(),
      usuario: `${reporte.usuario.nombres} ${reporte.usuario.apellidos}`,
    })),
    resumen: {
      totalUsuarios: overview.totalUsuarios,
      usuariosPremium: overview.usuariosPremium,
      ingresosEstimados: overview.ingresosEstimados,
      totalTareas: overview.totalTareas,
      totalProyectos: overview.totalProyectos,
      consultasPendientes: overview.consultasPendientes,
    },
    generadoPor: session?.user?.name ?? "Admin TaskUni",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reportes administrativos</h1>
        <p className="text-slate-500 dark:text-slate-400">Analiza el rendimiento del e-Business TaskUni mediante reportes de usuarios, suscripciones, pagos, soporte y uso académico.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardResumen titulo="Usuarios registrados" valor={overview.totalUsuarios} icon={Users} color="brand" />
        <CardResumen titulo="Usuarios Premium" valor={overview.usuariosPremium} icon={Crown} color="amber" />
        <CardResumen titulo="Ingresos estimados" valor={formatMoney(overview.ingresosEstimados)} icon={DollarSign} color="green" />
        <CardResumen titulo="Consultas pendientes" valor={overview.consultasPendientes} icon={LifeBuoy} color="red" />
      </div>

      <AdminReportesPanel data={data} generadoEn={generadoEn} />
    </div>
  );
}
