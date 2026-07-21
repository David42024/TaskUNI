"use client";

import { useTransition } from "react";
import { formatMoney } from "@/lib/taskuni-data";
import { cambiarEstadoPago } from "@/app/admin/pagos/actions";

type PagoCompleto = {
  id_pago: string;
  monto: any;
  metodo_pago: string;
  estado_pago: "aprobado" | "rechazado" | "pendiente";
  fecha_pago: Date;
  usuario: { nombres: string; apellidos: string };
  suscripcion: { plan: { nombre_plan: string } };
};

export default function TablaPagosClient({ pagos }: { pagos: PagoCompleto[] }) {
  const [isPending, startTransition] = useTransition();

  const handleEstadoChange = (id: string, nuevoEstado: "aprobado" | "rechazado" | "pendiente") => {
    startTransition(() => {
      cambiarEstadoPago(id, nuevoEstado);
    });
  };

  return (
    <div className="card !p-0 overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm">
      <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Historial de Pagos</h3>
        {isPending && <span className="text-sm text-brand-500 animate-pulse">Actualizando...</span>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 dark:bg-slate-900/50">
            <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Usuario</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Plan</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Monto</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Método</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Fecha</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap text-right">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-slate-950">
            {pagos.map((p) => (
              <tr key={p.id_pago} className="group hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors duration-200">
                <td className="py-4 px-6">
                  <p className="font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {p.usuario.nombres} {p.usuario.apellidos}
                  </p>
                </td>
                <td className="py-4 px-6">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {p.suscripcion.plan.nombre_plan}
                  </span>
                </td>
                <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200">
                  {formatMoney(Number(p.monto))}
                </td>
                <td className="py-4 px-6 text-slate-600 dark:text-slate-400 capitalize">
                  {p.metodo_pago}
                </td>
                <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                  {new Date(p.fecha_pago).toLocaleDateString("es-PE", { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="py-4 px-6 text-right">
                  <select
                    className="input py-1.5 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 shadow-sm focus:border-brand-500 focus:ring-brand-500/20 capitalize font-medium"
                    value={p.estado_pago}
                    onChange={(e) => handleEstadoChange(p.id_pago, e.target.value as any)}
                    disabled={isPending}
                  >
                    <option value="aprobado">Aprobado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="rechazado">Rechazado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
