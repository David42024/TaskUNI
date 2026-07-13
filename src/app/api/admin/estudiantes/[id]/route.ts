import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";

async function requireEstudiante(id_usuario: string) {
  return prisma.usuario.findFirst({ where: { id_usuario, rol: "estudiante" } });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSesionActual();
  if (!session?.user || session.user.rol !== "administrador") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const existente = await requireEstudiante(id);
  if (!existente) {
    return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
  }

  try {
    const body = await request.json();

    const usuario = await prisma.usuario.update({
      where: { id_usuario: id },
      data: {
        ...(body.nombres !== undefined && { nombres: body.nombres }),
        ...(body.apellidos !== undefined && { apellidos: body.apellidos }),
        ...(body.estado !== undefined && { estado: body.estado }),
      },
    });

    if (body.perfil) {
      await prisma.perfilEstudiante.upsert({
        where: { id_usuario: id },
        update: {
          ...(body.perfil.universidad !== undefined && { universidad: body.perfil.universidad }),
          ...(body.perfil.carrera !== undefined && { carrera: body.perfil.carrera }),
          ...(body.perfil.ciclo_academico !== undefined && { ciclo_academico: body.perfil.ciclo_academico }),
          ...(body.perfil.codigo_estudiante !== undefined && { codigo_estudiante: body.perfil.codigo_estudiante }),
        },
        create: {
          id_usuario: id,
          universidad: body.perfil.universidad ?? "",
          carrera: body.perfil.carrera ?? "",
          ciclo_academico: body.perfil.ciclo_academico ?? "",
          codigo_estudiante: body.perfil.codigo_estudiante || null,
        },
      });
    }

    const actualizado = await prisma.usuario.findUnique({
      where: { id_usuario: id },
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
    });

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al actualizar el estudiante" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSesionActual();
  if (!session?.user || session.user.rol !== "administrador") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const existente = await requireEstudiante(id);
  if (!existente) {
    return NextResponse.json({ error: "Estudiante no encontrado" }, { status: 404 });
  }

  await prisma.usuario.delete({ where: { id_usuario: id } });

  return NextResponse.json({ message: "Estudiante eliminado" });
}
