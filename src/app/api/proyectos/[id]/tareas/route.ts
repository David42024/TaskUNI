import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const proyecto = await prisma.proyecto.findFirst({
    where: {
      id_proyecto: id,
      OR: [
        { id_usuario_creador: session.user.id },
        { integrantes: { some: { id_usuario: session.user.id } } },
      ],
    },
  });
  if (!proyecto) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  const body = await request.json();
  if (!body.titulo || body.titulo.trim().length < 2) {
    return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
  }

  const tarea = await prisma.tareaProyecto.create({
    data: {
      id_proyecto: id,
      id_usuario_asignado: body.id_usuario_asignado || null,
      titulo: body.titulo,
      descripcion: body.descripcion || null,
      estado: body.estado || "pendiente",
      prioridad: body.prioridad || "media",
      fecha_limite: body.fecha_limite ? new Date(body.fecha_limite) : null,
      avance_porcentual: body.avance_porcentual ?? 0,
    },
  });

  return NextResponse.json(tarea, { status: 201 });
}
