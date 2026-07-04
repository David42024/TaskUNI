import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";
import AdminChrome from "@/components/AdminChrome";
import { getAdminNotifications } from "@/lib/taskuni-data";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSesionActual();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.rol !== "administrador") {
    redirect("/dashboard");
  }

  const [usuariosActivos, usuariosPremium, consultasPendientes, pagosAprobados, notificacionesItems] = await Promise.all([
    prisma.usuario.count({ where: { rol: "estudiante", estado: "activo" } }),
    prisma.suscripcion.count({
      where: { estado_suscripcion: "activa", plan: { tipo_plan: "premium" } },
    }),
    prisma.consultaSoporte.count({ where: { estado_consulta: "pendiente" } }),
    prisma.pago.findMany({ where: { estado_pago: "aprobado" }, select: { monto: true } }),
    getAdminNotifications(),
  ]);

  const ingresosEstimados = pagosAprobados.reduce((acumulado, pago) => acumulado + Number(pago.monto), 0);

  return (
    <AdminChrome
      header={{
        nombre: "Admin TaskUni",
        rol: "Administrador general",
        usuariosActivos,
        usuariosPremium,
        consultasPendientes,
        ingresosEstimados,
        notificacionesItems,
      }}
      sidebar={{
        nombre: "Admin TaskUni",
        usuariosBadge: usuariosActivos,
        soporteBadge: consultasPendientes,
        premiumBadge: usuariosPremium,
        pagosBadge: `S/ ${ingresosEstimados.toFixed(0)}`,
      }}
    >
      {children}
    </AdminChrome>
  );
}
