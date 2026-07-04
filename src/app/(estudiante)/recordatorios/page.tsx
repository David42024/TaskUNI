import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/session";
import CardResumen from "@/components/CardResumen";
import { Bell, CheckCircle2, Clock3, Trash2 } from "lucide-react";

const colorEstado: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  enviado: "bg-emerald-100 text-emerald-700",
  descartado: "bg-slate-100 text-slate-600",
};

export default async function RecordatoriosPage() {
  const user = await requireUsuario();
  const recordatorios = await prisma.recordatorio.findMany({
    where: { id_usuario: user.id },
    include: { tarea: { select: { titulo: true } }, proyecto: { select: { nombre_proyecto: true } } },
    orderBy: { fecha_recordatorio: "asc" },
  });

  const pendientes = recordatorios.filter((r) => r.estado === "pendiente").length;
  const enviados = recordatorios.filter((r) => r.estado === "enviado").length;
  const descartados = recordatorios.filter((r) => r.estado === "descartado").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Recordatorios</h1>
          <p className="text-slate-500 dark:text-slate-400">Alertas pendientes, enviadas y descartadas.</p>
        </div>
        <Link href="/calendario" className="btn-primary">Nuevo recordatorio</Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <CardResumen titulo="Pendientes" valor={pendientes} icon={Clock3} color="amber" />
        <CardResumen titulo="Enviados" valor={enviados} icon={CheckCircle2} color="green" />
        <CardResumen titulo="Descartados" valor={descartados} icon={Trash2} color="slate" />
      </div>

      <div className="grid gap-4">
        {recordatorios.map((recordatorio) => (
          <div key={recordatorio.id_recordatorio} className="card flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-white">{recordatorio.titulo}</h3>
                <span className={`badge ${colorEstado[recordatorio.estado]}`}>{recordatorio.estado}</span>
                <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">{recordatorio.tipo_recordatorio}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{recordatorio.descripcion ?? "Sin descripción"}</p>
              <p className="mt-2 text-xs text-slate-400">{new Date(recordatorio.fecha_recordatorio).toLocaleDateString("es-PE")}</p>
              <p className="mt-1 text-xs text-slate-400">
                {recordatorio.tarea?.titulo ?? recordatorio.proyecto?.nombre_proyecto ?? "Sin relación"}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary text-xs">Marcar como enviado</button>
              <button className="btn-secondary text-xs">Descartar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
