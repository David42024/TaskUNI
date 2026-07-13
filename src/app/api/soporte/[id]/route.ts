import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";

// Solo administradores pueden responder/cerrar consultas
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSesionActual();
  if (!session?.user || session.user.rol !== "administrador") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const consulta = await prisma.consultaSoporte.update({
    where: { id_consulta: id },
    data: {
      ...(body.respuesta !== undefined && { respuesta: body.respuesta }),
      ...(body.estado_consulta !== undefined && { estado_consulta: body.estado_consulta }),
      ...(body.respuesta !== undefined && { fecha_respuesta: new Date() }),
    },
  });

  return NextResponse.json(consulta);
}
