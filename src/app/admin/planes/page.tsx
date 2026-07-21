import { prisma } from "@/lib/prisma";
import CardResumen from "@/components/CardResumen";
import { Users, Clock3, CheckCircle2, Crown } from "lucide-react";
import AdminPlanesClient from "@/components/AdminPlanesClient";

export default async function AdminPlanesPage() {
  const [planesRaw, suscripcionesRaw] = await Promise.all([
    prisma.plan.findMany({ include: { suscripciones: true }, orderBy: { nombre_plan: "asc" } }),
    prisma.suscripcion.findMany({ include: { plan: true }, orderBy: { fecha_inicio: "desc" } }),
  ]);
  const planes = JSON.parse(JSON.stringify(planesRaw));
  const suscripciones = JSON.parse(JSON.stringify(suscripcionesRaw));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Planes y suscripciones</h1><p className="text-slate-500 dark:text-slate-400">Control del plan gratuito y Premium.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardResumen titulo="Planes" valor={planes.length} icon={Crown} color="brand" />
        <CardResumen titulo="Suscripciones activas" valor={suscripciones.filter((s: any) => s.estado_suscripcion === "activa").length} icon={CheckCircle2} color="green" />
        <CardResumen titulo="Vencidas" valor={suscripciones.filter((s: any) => s.estado_suscripcion === "vencida").length} icon={Clock3} color="amber" />
        <CardResumen titulo="Usuarios Premium" valor={suscripciones.filter((s: any) => s.plan?.tipo_plan === "premium").length} icon={Users} color="slate" />
      </div>
      <AdminPlanesClient planes={planes} />
    </div>
  );
}
