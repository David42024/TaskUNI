import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const proyecto = await prisma.proyecto.findUnique({ where: { id_proyecto: params.id } });
  if (!proyecto || proyecto.id_usuario_creador !== session.user.id) {
    return NextResponse.json(
      { error: "Solo el creador del proyecto puede invitar integrantes" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const correo = (body.correo || "").toLowerCase().trim();

  const usuario = await prisma.usuario.findUnique({ where: { correo_norm: correo } });
  if (!usuario) {
    return NextResponse.json(
      { error: "No se encontró ningún usuario registrado con ese correo" },
      { status: 404 }
    );
  }

  const existente = await prisma.integranteProyecto.findUnique({
    where: { id_proyecto_id_usuario: { id_proyecto: params.id, id_usuario: usuario.id_usuario } },
  }).catch(() => null);

  if (existente) {
    return NextResponse.json({ error: "El usuario ya es integrante del proyecto" }, { status: 409 });
  }

  const integrante = await prisma.integranteProyecto.create({
    data: {
      id_proyecto: params.id,
      id_usuario: usuario.id_usuario,
      responsabilidad: body.responsabilidad || null,
      estado: "invitado",
    },
    include: { usuario: { select: { nombres: true, apellidos: true, correo: true } } },
  });

  return NextResponse.json(integrante, { status: 201 });
}
