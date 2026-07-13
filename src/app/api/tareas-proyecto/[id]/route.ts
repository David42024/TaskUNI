import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";

async function tieneAccesoATareaProyecto(id_tarea_proyecto: string, id_usuario: string) {
  const tarea = await prisma.tareaProyecto.findUnique({
    where: { id_tarea_proyecto },
    include: { proyecto: { include: { integrantes: true } } },
  });
  if (!tarea) return null;
  const acceso =
    tarea.proyecto.id_usuario_creador === id_usuario ||
    tarea.proyecto.integrantes.some((i) => i.id_usuario === id_usuario);
  return acceso ? tarea : null;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const existente = await tieneAccesoATareaProyecto(id, session.user.id);
  if (!existente) {
    return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
  }

  const body = await request.json();
  const tarea = await prisma.tareaProyecto.update({
    where: { id_tarea_proyecto: id },
    data: {
      ...(body.titulo !== undefined && { titulo: body.titulo }),
      ...(body.descripcion !== undefined && { descripcion: body.descripcion }),
      ...(body.estado !== undefined && { estado: body.estado }),
      ...(body.prioridad !== undefined && { prioridad: body.prioridad }),
      ...(body.id_usuario_asignado !== undefined && { id_usuario_asignado: body.id_usuario_asignado || null }),
      ...(body.fecha_limite !== undefined && {
        fecha_limite: body.fecha_limite ? new Date(body.fecha_limite) : null,
      }),
      ...(body.avance_porcentual !== undefined && { avance_porcentual: body.avance_porcentual }),
    },
  });

  return NextResponse.json(tarea);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const existente = await tieneAccesoATareaProyecto(id, session.user.id);
  if (!existente) {
    return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
  }

  await prisma.tareaProyecto.delete({ where: { id_tarea_proyecto: id } });
  return NextResponse.json({ message: "Tarea eliminada" });
}
