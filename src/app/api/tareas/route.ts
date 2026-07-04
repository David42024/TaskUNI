import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";
import { tareaSchema } from "@/lib/validations";

export async function GET() {
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const tareas = await prisma.tarea.findMany({
    where: { id_usuario: session.user.id },
    include: { curso: true },
    orderBy: [{ fecha_limite: "asc" }],
  });

  return NextResponse.json(tareas);
}

export async function POST(request: Request) {
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const datos = tareaSchema.parse(body);

    const tarea = await prisma.tarea.create({
      data: {
        id_usuario: session.user.id,
        id_curso: datos.id_curso || null,
        titulo: datos.titulo,
        descripcion: datos.descripcion || null,
        fecha_limite: datos.fecha_limite ? new Date(datos.fecha_limite) : null,
        prioridad: datos.prioridad,
        estado_tarea: datos.estado_tarea,
        avance_porcentual: datos.avance_porcentual,
      },
    });

    return NextResponse.json(tarea, { status: 201 });
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: error.issues[0]?.message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Error al crear la tarea" }, { status: 500 });
  }
}
