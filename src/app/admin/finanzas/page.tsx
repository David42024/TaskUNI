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
      <div className="card p-8 border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Desglose de Costos Operativos</h3>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(([nombre, valor]) => (
            <div key={nombre} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-white/5 hover:border-brand-500/20 transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{nombre}</p>
                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-slate-400 group-hover:text-brand-500 transition-colors">
                  <TrendingDown size={14} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                S/ {valor.toFixed(2)}
              </p>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                <div 
                  className="bg-brand-500 h-full rounded-full opacity-50 group-hover:opacity-100 transition-opacity" 
                  style={{ width: `${(valor / costos) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
