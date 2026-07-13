import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSesionActual();
  if (!session?.user || session.user.rol !== "administrador") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const usuario = await prisma.usuario.update({
    where: { id_usuario: id },
    data: {
      ...(body.estado !== undefined && { estado: body.estado }),
      ...(body.rol !== undefined && { rol: body.rol }),
    },
  });

  return NextResponse.json(usuario);
}
