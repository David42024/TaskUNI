import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const recordatorio = await prisma.recordatorio.findUnique({
    where: { id_recordatorio: id },
  });

  if (!recordatorio || recordatorio.id_usuario !== session.user.id) {
    return NextResponse.json({ error: "No encontrado o no autorizado" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const actualizado = await prisma.recordatorio.update({
      where: { id_recordatorio: id },
      data: {
        ...(body.estado !== undefined && { estado: body.estado }),
        ...(body.titulo !== undefined && { titulo: body.titulo }),
        ...(body.descripcion !== undefined && { descripcion: body.descripcion }),
        ...(body.fecha_recordatorio !== undefined && { fecha_recordatorio: new Date(body.fecha_recordatorio) }),
        ...(body.tipo_recordatorio !== undefined && { tipo_recordatorio: body.tipo_recordatorio }),
      },
    });

    return NextResponse.json(actualizado);
  } catch (err: any) {
    return NextResponse.json({ error: "Error al actualizar el recordatorio" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const recordatorio = await prisma.recordatorio.findUnique({
    where: { id_recordatorio: id },
  });

  if (!recordatorio || recordatorio.id_usuario !== session.user.id) {
    return NextResponse.json({ error: "No encontrado o no autorizado" }, { status: 404 });
  }

  try {
    await prisma.recordatorio.delete({
      where: { id_recordatorio: id },
    });
    return NextResponse.json({ message: "Recordatorio eliminado correctamente" });
  } catch (err: any) {
    return NextResponse.json({ error: "Error al eliminar el recordatorio" }, { status: 500 });
  }
}
