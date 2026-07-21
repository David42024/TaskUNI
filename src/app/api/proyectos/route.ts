import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";
import { proyectoSchema } from "@/lib/validations";

export async function GET() {
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const proyectos = await prisma.proyecto.findMany({
    where: {
      OR: [
        { id_usuario_creador: session.user.id },
        { integrantes: { some: { id_usuario: session.user.id } } },
      ],
    },
    include: {
      integrantes: { include: { usuario: { select: { nombres: true, apellidos: true, correo: true } } } },
      tareas: { include: { asignado: { select: { id_usuario: true, nombres: true, apellidos: true, correo: true } } } },
      creador: { select: { nombres: true, apellidos: true } },
    },
    orderBy: { fecha_creacion: "desc" },
  });

  return NextResponse.json(proyectos);
}

export async function POST(request: Request) {
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const datos = proyectoSchema.parse(body);

    const proyecto = await prisma.proyecto.create({
      data: {
        id_usuario_creador: session.user.id,
        nombre_proyecto: datos.nombre_proyecto,
        descripcion: datos.descripcion || null,
        fecha_entrega: datos.fecha_entrega ? new Date(datos.fecha_entrega) : null,
        estado_proyecto: datos.estado_proyecto,
        avance_general: datos.avance_general,
        integrantes: {
          create: {
            id_usuario: session.user.id,
            rol_en_proyecto: "líder",
            estado: "activo",
          },
        },
      },
      include: { integrantes: true },
    });

    return NextResponse.json(proyecto, { status: 201 });
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: error.issues[0]?.message }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Error al crear el proyecto" }, { status: 500 });
  }
}
