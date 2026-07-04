import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getSesionActual() {
  return getServerSession(authOptions);
}

export async function requireUsuario() {
  const session = await getSesionActual();
  if (!session?.user) {
    throw new Error("No autenticado");
  }
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUsuario();
  if (user.rol !== "administrador") {
    throw new Error("No autorizado");
  }
  return user;
}
