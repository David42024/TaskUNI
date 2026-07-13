import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";

export async function GET() {
  const session = await getSesionActual();
  if (!session?.user || session.user.rol !== "administrador") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id_usuario: true,
        nombres: true,
        apellidos: true,
        correo: true,
        rol: true,
        estado: true,
        fecha_registro: true,
        ultimo_acceso: true,
        perfil_estudiante: true,
        suscripciones: {
          where: { estado_suscripcion: "activa" },
          include: { plan: true },
          take: 1,
          orderBy: { fecha_inicio: "desc" },
        },
        _count: { select: { tareas: true, proyectos_creados: true } },
      },
      orderBy: { fecha_registro: "desc" },
    });

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error("[GET /api/admin/usuarios]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
