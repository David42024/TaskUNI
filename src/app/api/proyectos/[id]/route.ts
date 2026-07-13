import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";
import { proyectoSchema } from "@/lib/validations";

async function tieneAcceso(id_proyecto: string, id_usuario: string) {
  const proyecto = await prisma.proyecto.findFirst({
    where: {
      id_proyecto,
      OR: [
        { id_usuario_creador: id_usuario },
        { integrantes: { some: { id_usuario } } },
      ],
    },
  });
  return proyecto;
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const proyecto = await tieneAcceso(id, session.user.id);
  if (!proyecto) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const datos = proyectoSchema.partial().parse(body);

    const actualizado = await prisma.proyecto.update({
      where: { id_proyecto: id },
      data: {
        ...(datos.nombre_proyecto !== undefined && { nombre_proyecto: datos.nombre_proyecto }),
        ...(datos.descripcion !== undefined && { descripcion: datos.descripcion }),
        ...(datos.fecha_entrega !== undefined && {
          fecha_entrega: datos.fecha_entrega ? new Date(datos.fecha_entrega) : null,
        }),
        ...(datos.estado_proyecto !== undefined && { estado_proyecto: datos.estado_proyecto }),
        ...(datos.avance_general !== undefined && { avance_general: datos.avance_general }),
      },
    });

    return NextResponse.json(actualizado);
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: error.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al actualizar el proyecto" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const proyecto = await prisma.proyecto.findUnique({ where: { id_proyecto: id } });
  if (!proyecto || proyecto.id_usuario_creador !== session.user.id) {
    return NextResponse.json(
      { error: "Solo el creador del proyecto puede eliminarlo" },
      { status: 403 }
    );
  }

  await prisma.proyecto.delete({ where: { id_proyecto: id } });
  return NextResponse.json({ message: "Proyecto eliminado" });
}
