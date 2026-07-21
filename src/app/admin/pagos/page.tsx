import { prisma } from "@/lib/prisma";
import CardResumen from "@/components/CardResumen";
import { formatMoney } from "@/lib/taskuni-data";
import TablaPagosClient from "@/components/TablaPagosClient";
import { DollarSign, CheckCircle2, Clock3, XCircle } from "lucide-react";

export default async function AdminPagosPage() {
  const pagosRaw = await prisma.pago.findMany({ include: { usuario: true, suscripcion: { include: { plan: true } } }, orderBy: { fecha_pago: "desc" } });
  const pagos = JSON.parse(JSON.stringify(pagosRaw));
  const aprobados = pagos.filter((p: any) => p.estado_pago === "aprobado");

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pagos</h1><p className="text-slate-500 dark:text-slate-400">Ingresos y estado de cobros de la plataforma.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardResumen titulo="Total ingresos" valor={formatMoney(aprobados.reduce((a: number, p: any) => a + Number(p.monto), 0))} icon={DollarSign} color="green" />
        <CardResumen titulo="Aprobados" valor={pagos.filter((p: any) => p.estado_pago === "aprobado").length} icon={CheckCircle2} color="green" />
        <CardResumen titulo="Pendientes" valor={pagos.filter((p: any) => p.estado_pago === "pendiente").length} icon={Clock3} color="amber" />
        <CardResumen titulo="Rechazados" valor={pagos.filter((p: any) => p.estado_pago === "rechazado").length} icon={XCircle} color="red" />
      </div>
      <TablaPagosClient pagos={pagos} />
    </div>
  );
}
