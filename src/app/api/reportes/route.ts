import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";

// Genera (o regenera) el reporte de productividad del mes actual para el usuario autenticado,
// calculado en tiempo real a partir de sus tareas.
export async function GET() {
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const tareas = await prisma.tarea.findMany({ where: { id_usuario: session.user.id } });

  const total_tareas = tareas.length;
  const tareas_completadas = tareas.filter((t) => t.estado_tarea === "completada").length;
  const tareas_pendientes = tareas.filter((t) => t.estado_tarea === "pendiente").length;
  const tareas_vencidas = tareas.filter((t) => t.estado_tarea === "vencida").length;
  const porcentaje_cumplimiento =
    total_tareas > 0 ? Math.round((tareas_completadas / total_tareas) * 100) : 0;

  const hoy = new Date();
  const periodo = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}`;

  const existente = await prisma.reporteProductividad.findFirst({
    where: { id_usuario: session.user.id, periodo },
  });

  const datosReporte = {
    total_tareas,
    tareas_completadas,
    tareas_pendientes,
    tareas_vencidas,
    porcentaje_cumplimiento,
  };

  const reporte = existente
    ? await prisma.reporteProductividad.update({
        where: { id_reporte: existente.id_reporte },
        data: datosReporte,
      })
    : await prisma.reporteProductividad.create({
        data: {
          id_usuario: session.user.id,
          periodo,
          racha_productividad: 0,
          ...datosReporte,
        },
      });

  return NextResponse.json(reporte);
}
