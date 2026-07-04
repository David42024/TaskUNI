import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";
import { eventoSchema } from "@/lib/validations";

export async function GET() {
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const eventos = await prisma.eventoCalendario.findMany({
    where: { id_usuario: session.user.id },
    orderBy: { fecha_inicio: "asc" },
  });
  return NextResponse.json(eventos);
}

export async function POST(request: Request) {
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const datos = eventoSchema.parse(body);

    const evento = await prisma.eventoCalendario.create({
      data: {
        id_usuario: session.user.id,
        titulo: datos.titulo,
        descripcion: datos.descripcion || null,
        tipo_evento: datos.tipo_evento,
        fecha_inicio: new Date(datos.fecha_inicio),
        fecha_fin: datos.fecha_fin ? new Date(datos.fecha_fin) : null,
        ubicacion: datos.ubicacion || null,
      },
    });

    return NextResponse.json(evento, { status: 201 });
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: error.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al crear el evento" }, { status: 500 });
  }
}
