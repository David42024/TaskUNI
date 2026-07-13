import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const evento = await prisma.eventoCalendario.findUnique({ where: { id_evento: id } });
  if (!evento || evento.id_usuario !== session.user.id) {
    return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
  }
  await prisma.eventoCalendario.delete({ where: { id_evento: id } });
  return NextResponse.json({ message: "Evento eliminado" });
}
