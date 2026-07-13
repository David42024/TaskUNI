import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";

export async function GET() {
  const session = await getSesionActual();
  if (!session?.user || session.user.rol !== "administrador") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const tareas = await prisma.tarea.findMany({
    include: { usuario: { select: { nombres: true, apellidos: true, correo: true } }, curso: true },
    orderBy: { fecha_limite: "asc" },
  });

  return NextResponse.json(tareas);
}
