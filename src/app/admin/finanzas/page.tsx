import { prisma } from "@/lib/prisma";
import CardResumen from "@/components/CardResumen";
import { Banknote, DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export default async function AdminFinanzasPage() {
  const [pagos, premium] = await Promise.all([
    prisma.pago.findMany({ where: { estado_pago: "aprobado" }, select: { monto: true } }),
    prisma.suscripcion.count({ where: { estado_suscripcion: "activa", plan: { tipo_plan: "premium" } } }),
  ]);
  const ingresos = pagos.reduce((a, p) => a + Number(p.monto), 0);
  const costos = 180 + 90 + 120 + 160 + 220;
  const rentabilidad = ingresos - costos;

  const items = [
    ["Hosting", 180], ["Base de datos", 90], ["Publicidad", 120], ["Soporte", 160], ["Desarrollo", 220],
  ] as const;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Finanzas</h1><p className="text-slate-500 dark:text-slate-400">Ingresos, costos y rentabilidad estimada.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardResumen titulo="Ingresos" valor={`S/ ${ingresos.toFixed(2)}`} icon={DollarSign} color="green" />
        <CardResumen titulo="Usuarios Premium" valor={premium} icon={Banknote} color="brand" />
        <CardResumen titulo="Costos" valor={`S/ ${costos.toFixed(2)}`} icon={TrendingDown} color="red" />
        <CardResumen titulo="Rentabilidad" valor={`S/ ${rentabilidad.toFixed(2)}`} icon={TrendingUp} color={rentabilidad >= 0 ? "green" : "red"} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map(([nombre, valor]) => <div key={nombre} className="card"><p className="text-sm text-slate-500 dark:text-slate-400">{nombre}</p><p className="text-xl font-bold text-slate-900 dark:text-white">S/ {valor.toFixed(2)}</p></div>)}
      </div>
    </div>
  );
}
