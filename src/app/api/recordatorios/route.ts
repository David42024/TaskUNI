import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";

export async function GET() {
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const recordatorios = await prisma.recordatorio.findMany({
    where: { id_usuario: session.user.id },
    include: {
      tarea: { select: { titulo: true } },
      proyecto: { select: { nombre_proyecto: true } },
      evento: { select: { titulo: true } },
    },
    orderBy: { fecha_recordatorio: "asc" },
  });

  return NextResponse.json(recordatorios);
}

export async function POST(request: Request) {
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.titulo || !body.fecha_recordatorio) {
      return NextResponse.json({ error: "Título y fecha de recordatorio son obligatorios" }, { status: 400 });
    }

    const recordatorio = await prisma.recordatorio.create({
      data: {
        id_usuario: session.user.id,
        titulo: body.titulo,
        descripcion: body.descripcion || null,
        fecha_recordatorio: new Date(body.fecha_recordatorio),
        tipo_recordatorio: body.tipo_recordatorio || "basico",
        estado: "pendiente",
        id_tarea: body.id_tarea || null,
        id_proyecto: body.id_proyecto || null,
        id_evento: body.id_evento || null,
      },
      include: {
        tarea: { select: { titulo: true } },
        proyecto: { select: { nombre_proyecto: true } },
        evento: { select: { titulo: true } },
      },
    });

    return NextResponse.json(recordatorio, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Error al crear el recordatorio" }, { status: 500 });
  }
}
