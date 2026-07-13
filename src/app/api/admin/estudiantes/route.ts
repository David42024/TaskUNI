import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";

export async function GET() {
  const session = await getSesionActual();
  if (!session?.user || session.user.rol !== "administrador") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const estudiantes = await prisma.usuario.findMany({
    where: { rol: "estudiante" },
    select: {
      id_usuario: true,
      nombres: true,
      apellidos: true,
      correo: true,
      estado: true,
      fecha_registro: true,
      perfil_estudiante: true,
      suscripciones: { include: { plan: true }, take: 1, orderBy: { fecha_inicio: "desc" } },
      _count: { select: { tareas: true, proyectos_creados: true } },
    },
    orderBy: { fecha_registro: "desc" },
  });

  return NextResponse.json(estudiantes);
}
