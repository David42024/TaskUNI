import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";

export async function GET() {
  const session = await getSesionActual();
  if (!session?.user || session.user.rol !== "administrador") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const [
    totalUsuarios,
    usuariosActivos,
    usuariosPremium,
    usuariosGratuitos,
    totalTareas,
    totalProyectos,
    consultasPendientes,
    pagosAprobados,
  ] = await Promise.all([
    prisma.usuario.count({ where: { rol: "estudiante" } }),
    prisma.usuario.count({ where: { rol: "estudiante", estado: "activo" } }),
    prisma.suscripcion.count({
      where: { estado_suscripcion: "activa", plan: { tipo_plan: "premium" } },
    }),
    prisma.suscripcion.count({
      where: { estado_suscripcion: "activa", plan: { tipo_plan: "gratuito" } },
    }),
    prisma.tarea.count(),
    prisma.proyecto.count(),
    prisma.consultaSoporte.count({ where: { estado_consulta: "pendiente" } }),
    prisma.pago.findMany({ where: { estado_pago: "aprobado" }, select: { monto: true } }),
  ]);

  const ingresosEstimados = pagosAprobados.reduce((acc, p) => acc + Number(p.monto), 0);

  // Registros nuevos por mes (últimos 6 meses) para el gráfico de crecimiento
  const usuarios = await prisma.usuario.findMany({
    where: { rol: "estudiante" },
    select: { fecha_registro: true },
  });

  const seisMesesAtras = new Date();
  seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 5);
  const conteoPorMes: Record<string, number> = {};
  for (let i = 0; i < 6; i++) {
    const fecha = new Date(seisMesesAtras);
    fecha.setMonth(seisMesesAtras.getMonth() + i);
    const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    conteoPorMes[clave] = 0;
  }
  usuarios.forEach((u) => {
    const clave = `${u.fecha_registro.getFullYear()}-${String(u.fecha_registro.getMonth() + 1).padStart(2, "0")}`;
    if (conteoPorMes[clave] !== undefined) conteoPorMes[clave]++;
  });

  const crecimiento = Object.entries(conteoPorMes).map(([mes, nuevos]) => ({ mes, nuevos }));

  return NextResponse.json({
    totalUsuarios,
    usuariosActivos,
    usuariosPremium,
    usuariosGratuitos,
    totalTareas,
    totalProyectos,
    consultasPendientes,
    ingresosEstimados,
    crecimiento,
  });
}
