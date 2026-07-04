const servicios = [
  { nombre: "Plataforma web", valor: "99.9%", detalle: "Uptime" },
  { nombre: "Último backup", valor: "Hoy 02:00", detalle: "Respaldo en nube" },
  { nombre: "Servicios activos", valor: "12", detalle: "API, DB, Auth, Analytics" },
  { nombre: "Incidencias abiertas", valor: "2", detalle: "Seguimiento operativo" },
  { nombre: "Tiempo respuesta", valor: "18 min", detalle: "Soporte técnico" },
  { nombre: "Usuarios conectados", valor: "248", detalle: "Sesiones activas" },
];

export default function AdminLogisticaPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Logística digital</h1><p className="text-slate-500 dark:text-slate-400">Operación, nube, backups y disponibilidad del sistema.</p></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{servicios.map((s) => <div key={s.nombre} className="card"><p className="text-xs uppercase tracking-[0.2em] text-slate-400">{s.detalle}</p><p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{s.valor}</p><p className="text-sm text-slate-500 dark:text-slate-400">{s.nombre}</p></div>)}</div>
    </div>
  );
}
