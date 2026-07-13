import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";

// Invite a member
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const proyecto = await prisma.proyecto.findUnique({ where: { id_proyecto: id } });
  if (!proyecto) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  // Only creator or docente can invite members
  const isCreator = proyecto.id_usuario_creador === session.user.id;
  const isDocente = await prisma.integranteProyecto.findFirst({
    where: { id_proyecto: id, id_usuario: session.user.id, rol_en_proyecto: "docente", estado: "activo" },
  });

  if (!isCreator && !isDocente) {
    return NextResponse.json(
      { error: "No autorizado para invitar integrantes" },
      { status: 403 }
    );
  }

  const body = await request.json();
  const correo = (body.correo || "").toLowerCase().trim();
  const rol = body.rol_en_proyecto || "miembro";

  const usuario = await prisma.usuario.findUnique({ where: { correo_norm: correo } });
  if (!usuario) {
    return NextResponse.json(
      { error: "No se encontró ningún usuario registrado con ese correo" },
      { status: 404 }
    );
  }

  const existente = await prisma.integranteProyecto.findUnique({
    where: { id_proyecto_id_usuario: { id_proyecto: id, id_usuario: usuario.id_usuario } },
  }).catch(() => null);

  if (existente) {
    return NextResponse.json({ error: "El usuario ya es integrante del proyecto" }, { status: 409 });
  }

  const integrante = await prisma.integranteProyecto.create({
    data: {
      id_proyecto: id,
      id_usuario: usuario.id_usuario,
      responsabilidad: body.responsabilidad || null,
      rol_en_proyecto: rol,
      estado: "invitado",
    },
    include: { usuario: { select: { nombres: true, apellidos: true, correo: true } } },
  });

  return NextResponse.json(integrante, { status: 201 });
}

// Accept an invitation or update a member's details
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const proyecto = await prisma.proyecto.findUnique({ where: { id_proyecto: id } });
  if (!proyecto) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  const body = await request.json();
  const targetUsuarioId = body.id_usuario || session.user.id;

  const membership = await prisma.integranteProyecto.findUnique({
    where: { id_proyecto_id_usuario: { id_proyecto: id, id_usuario: targetUsuarioId } },
  });

  if (!membership) {
    return NextResponse.json({ error: "Membresía no encontrada" }, { status: 404 });
  }

  // Case 1: Accepting own invitation
  if (targetUsuarioId === session.user.id && body.estado === "activo") {
    if (membership.estado !== "invitado") {
      return NextResponse.json({ error: "La invitación ya no está pendiente" }, { status: 400 });
    }
    const actualizado = await prisma.integranteProyecto.update({
      where: { id_integrante: membership.id_integrante },
      data: { estado: "activo" },
      include: { usuario: { select: { nombres: true, apellidos: true, correo: true } } },
    });
    return NextResponse.json(actualizado);
  }

  // Case 2: Docente or Creator updating someone else's details
  const isCreator = proyecto.id_usuario_creador === session.user.id;
  const isDocente = await prisma.integranteProyecto.findFirst({
    where: { id_proyecto: id, id_usuario: session.user.id, rol_en_proyecto: "docente", estado: "activo" },
  });

  if (!isCreator && !isDocente) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const actualizado = await prisma.integranteProyecto.update({
    where: { id_integrante: membership.id_integrante },
    data: {
      ...(body.rol_en_proyecto !== undefined && { rol_en_proyecto: body.rol_en_proyecto }),
      ...(body.responsabilidad !== undefined && { responsabilidad: body.responsabilidad || null }),
      ...(body.estado !== undefined && { estado: body.estado }),
    },
    include: { usuario: { select: { nombres: true, apellidos: true, correo: true } } },
  });

  return NextResponse.json(actualizado);
}

// Remove a member or decline/cancel an invitation
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const proyecto = await prisma.proyecto.findUnique({ where: { id_proyecto: id } });
  if (!proyecto) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  // Read targetUsuarioId from query param or body
  const { searchParams } = new URL(request.url);
  let targetUsuarioId = searchParams.get("id_usuario") || searchParams.get("usuarioId");

  if (!targetUsuarioId) {
    try {
      const body = await request.clone().json();
      targetUsuarioId = body.id_usuario;
    } catch {}
  }

  if (!targetUsuarioId) {
    targetUsuarioId = session.user.id; // Default to self
  }

  const membership = await prisma.integranteProyecto.findUnique({
    where: { id_proyecto_id_usuario: { id_proyecto: id, id_usuario: targetUsuarioId } },
  });

  if (!membership) {
    return NextResponse.json({ error: "Membresía no encontrada" }, { status: 404 });
  }

  // Case 1: Declining/leaving own membership
  if (targetUsuarioId === session.user.id) {
    await prisma.integranteProyecto.delete({ where: { id_integrante: membership.id_integrante } });
    return NextResponse.json({ message: "Salió del proyecto exitosamente" });
  }

  // Case 2: Creator or Docente removing another user
  const isCreator = proyecto.id_usuario_creador === session.user.id;
  const isDocente = await prisma.integranteProyecto.findFirst({
    where: { id_proyecto: id, id_usuario: session.user.id, rol_en_proyecto: "docente", estado: "activo" },
  });

  if (!isCreator && !isDocente) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  await prisma.integranteProyecto.delete({ where: { id_integrante: membership.id_integrante } });
  return NextResponse.json({ message: "Integrante removido del proyecto" });
}
