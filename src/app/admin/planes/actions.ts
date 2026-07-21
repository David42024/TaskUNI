"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSesionActual } from "@/lib/session";

export async function actualizarPlan(id_plan: string, data: { precio_mensual: number; descripcion: string; estado: string }) {
  const session = await getSesionActual();
  if (!session?.user || session.user.rol !== "administrador") {
    throw new Error("No autorizado");
  }

  await prisma.plan.update({
    where: { id_plan },
    data: {
      precio_mensual: data.precio_mensual,
      descripcion: data.descripcion,
      estado: data.estado,
    },
  });

  revalidatePath("/admin/planes");
  return { success: true };
}
