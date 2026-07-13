import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";
import { tareaSchema } from "@/lib/validations";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSesionActual();
  if (!session?.user || session.user.rol !== "administrador") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const existente = await prisma.tarea.findUnique({ where: { id_tarea: params.id } });
  if (!existente) {
    return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const datos = tareaSchema.partial().parse(body);

    const tarea = await prisma.tarea.update({
      where: { id_tarea: params.id },
      data: {
        ...(datos.titulo !== undefined && { titulo: datos.titulo }),
        ...(datos.descripcion !== undefined && { descripcion: datos.descripcion }),
        ...(datos.fecha_limite !== undefined && {
          fecha_limite: datos.fecha_limite ? new Date(datos.fecha_limite) : null,
        }),
        ...(datos.prioridad !== undefined && { prioridad: datos.prioridad }),
        ...(datos.estado_tarea !== undefined && { estado_tarea: datos.estado_tarea }),
        ...(datos.avance_porcentual !== undefined && {
          avance_porcentual: datos.avance_porcentual,
        }),
      },
      include: { usuario: { select: { nombres: true, apellidos: true, correo: true } }, curso: true },
    });

    return NextResponse.json(tarea);
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: error.issues[0]?.message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Error al actualizar la tarea" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getSesionActual();
  if (!session?.user || session.user.rol !== "administrador") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const existente = await prisma.tarea.findUnique({ where: { id_tarea: params.id } });
  if (!existente) {
    return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
  }

  await prisma.tarea.delete({ where: { id_tarea: params.id } });
  return NextResponse.json({ message: "Tarea eliminada" });
}
