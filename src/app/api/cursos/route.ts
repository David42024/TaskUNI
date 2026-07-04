import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";

export async function GET() {
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const cursos = await prisma.curso.findMany({
    where: { id_usuario: session.user.id },
    orderBy: { nombre_curso: "asc" },
  });
  return NextResponse.json(cursos);
}

export async function POST(request: Request) {
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.nombre_curso || body.nombre_curso.trim().length < 2) {
    return NextResponse.json({ error: "El nombre del curso es obligatorio" }, { status: 400 });
  }
  const curso = await prisma.curso.create({
    data: {
      id_usuario: session.user.id,
      nombre_curso: body.nombre_curso,
      docente: body.docente || null,
      ciclo: body.ciclo || null,
    },
  });
  return NextResponse.json(curso, { status: 201 });
}
