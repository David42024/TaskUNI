"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSesionActual } from "@/lib/session";

export async function cambiarEstadoPago(id_pago: string, estado: "aprobado" | "rechazado" | "pendiente") {
  const session = await getSesionActual();
  if (!session?.user || session.user.rol !== "administrador") {
    throw new Error("No autorizado");
  }

  await prisma.pago.update({
    where: { id_pago },
    data: { estado_pago: estado },
  });

  revalidatePath("/admin/pagos");
  return { success: true };
}
