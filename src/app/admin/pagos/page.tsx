import { prisma } from "@/lib/prisma";
import CardResumen from "@/components/CardResumen";
import { DollarSign, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { formatMoney } from "@/lib/taskuni-data";

export default async function AdminPagosPage() {
  const pagos = await prisma.pago.findMany({ include: { usuario: true, suscripcion: { include: { plan: true } } }, orderBy: { fecha_pago: "desc" } });
  const aprobados = pagos.filter((p) => p.estado_pago === "aprobado");

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pagos</h1><p className="text-slate-500 dark:text-slate-400">Ingresos y estado de cobros de la plataforma.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardResumen titulo="Total ingresos" valor={formatMoney(aprobados.reduce((a, p) => a + Number(p.monto), 0))} icon={DollarSign} color="green" />
        <CardResumen titulo="Aprobados" valor={pagos.filter((p) => p.estado_pago === "aprobado").length} icon={CheckCircle2} color="green" />
        <CardResumen titulo="Pendientes" valor={pagos.filter((p) => p.estado_pago === "pendiente").length} icon={Clock3} color="amber" />
        <CardResumen titulo="Rechazados" valor={pagos.filter((p) => p.estado_pago === "rechazado").length} icon={XCircle} color="red" />
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead><tr className="border-b border-slate-200 text-slate-500"><th className="py-2 pr-4 font-medium">Usuario</th><th className="py-2 pr-4 font-medium">Plan</th><th className="py-2 pr-4 font-medium">Monto</th><th className="py-2 pr-4 font-medium">Método</th><th className="py-2 pr-4 font-medium">Estado</th><th className="py-2 pr-4 font-medium">Fecha</th></tr></thead>
          <tbody>{pagos.map((p) => <tr key={p.id_pago} className="border-b border-slate-100 last:border-0"><td className="py-2 pr-4 text-slate-900 dark:text-white">{p.usuario.nombres} {p.usuario.apellidos}</td><td className="py-2 pr-4 text-slate-500">{p.suscripcion.plan.nombre_plan}</td><td className="py-2 pr-4 text-slate-500">{formatMoney(Number(p.monto))}</td><td className="py-2 pr-4 text-slate-500">{p.metodo_pago}</td><td className="py-2 pr-4"><span className="badge bg-brand-100 text-brand-700">{p.estado_pago}</span></td><td className="py-2 pr-4 text-slate-500">{new Date(p.fecha_pago).toLocaleDateString("es-PE")}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
