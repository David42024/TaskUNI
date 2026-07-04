import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";

export async function GET() {
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const suscripcion = await prisma.suscripcion.findFirst({
    where: { id_usuario: session.user.id, estado_suscripcion: "activa" },
    include: { plan: true },
    orderBy: { fecha_inicio: "desc" },
  });
  return NextResponse.json(suscripcion);
}

// Simula el cambio de plan (upgrade/downgrade) sin pasarela de pago real.
// El equipo puede reemplazar esto por la integración real de pagos.
export async function POST(request: Request) {
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const plan = await prisma.plan.findUnique({ where: { id_plan: body.id_plan } });
  if (!plan) {
    return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
  }

  await prisma.suscripcion.updateMany({
    where: { id_usuario: session.user.id, estado_suscripcion: "activa" },
    data: { estado_suscripcion: "cancelada", fecha_fin: new Date() },
  });

  const nuevaSuscripcion = await prisma.suscripcion.create({
    data: {
      id_usuario: session.user.id,
      id_plan: plan.id_plan,
      estado_suscripcion: "activa",
    },
    include: { plan: true },
  });

  if (Number(plan.precio_mensual) > 0) {
    await prisma.pago.create({
      data: {
        id_usuario: session.user.id,
        id_suscripcion: nuevaSuscripcion.id_suscripcion,
        monto: plan.precio_mensual,
        metodo_pago: "simulado",
        estado_pago: "aprobado",
      },
    });
  }

  return NextResponse.json(nuevaSuscripcion, { status: 201 });
}
