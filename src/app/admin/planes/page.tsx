import { prisma } from "@/lib/prisma";
import CardResumen from "@/components/CardResumen";
import { Crown, Users, Clock3, CheckCircle2 } from "lucide-react";

export default async function AdminPlanesPage() {
  const [planes, suscripciones] = await Promise.all([
    prisma.plan.findMany({ include: { suscripciones: true }, orderBy: { nombre_plan: "asc" } }),
    prisma.suscripcion.findMany({ include: { plan: true }, orderBy: { fecha_inicio: "desc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Planes y suscripciones</h1><p className="text-slate-500 dark:text-slate-400">Control del plan gratuito y Premium.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardResumen titulo="Planes" valor={planes.length} icon={Crown} color="brand" />
        <CardResumen titulo="Suscripciones activas" valor={suscripciones.filter((s) => s.estado_suscripcion === "activa").length} icon={CheckCircle2} color="green" />
        <CardResumen titulo="Vencidas" valor={suscripciones.filter((s) => s.estado_suscripcion === "vencida").length} icon={Clock3} color="amber" />
        <CardResumen titulo="Usuarios Premium" valor={suscripciones.filter((s) => s.plan.tipo_plan === "premium").length} icon={Users} color="slate" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {planes.map((plan) => (
          <div key={plan.id_plan} className="card space-y-3">
            <div className="flex items-center justify-between"><h3 className="text-lg font-semibold text-slate-800 dark:text-white">{plan.nombre_plan}</h3><span className="badge bg-brand-100 text-brand-700">{plan.tipo_plan}</span></div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{plan.descripcion}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">S/ {Number(plan.precio_mensual).toFixed(2)} <span className="text-sm font-normal text-slate-400">/mes</span></p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Suscripciones: {plan.suscripciones.length}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
