import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";
import { soporteSchema } from "@/lib/validations";

export async function GET() {
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (session.user.rol === "administrador") {
    const consultas = await prisma.consultaSoporte.findMany({
      include: { usuario: { select: { nombres: true, apellidos: true, correo: true } } },
      orderBy: { fecha_envio: "desc" },
    });
    return NextResponse.json(consultas);
  }

  const consultas = await prisma.consultaSoporte.findMany({
    where: { id_usuario: session.user.id },
    orderBy: { fecha_envio: "desc" },
  });
  return NextResponse.json(consultas);
}

export async function POST(request: Request) {
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const datos = soporteSchema.parse(body);

    const consulta = await prisma.consultaSoporte.create({
      data: {
        id_usuario: session.user.id,
        asunto: datos.asunto,
        mensaje: datos.mensaje,
      },
    });

    return NextResponse.json(consulta, { status: 201 });
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: error.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al enviar la consulta" }, { status: 500 });
  }
}
