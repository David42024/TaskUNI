const equipo = [
  { nombre: "Valeria Ponce", area: "Desarrollo", rol: "Full Stack", carga: "Alta" },
  { nombre: "Diego Ramos", area: "Diseño UX/UI", rol: "Product Designer", carga: "Media" },
  { nombre: "María Santos", area: "Marketing", rol: "Growth Specialist", carga: "Media" },
  { nombre: "Luis Herrera", area: "Soporte", rol: "Customer Success", carga: "Alta" },
  { nombre: "Ana Medina", area: "Finanzas", rol: "Analista", carga: "Baja" },
  { nombre: "Carlos Vega", area: "Administración", rol: "Administrador general", carga: "Alta" },
];

export default function AdminRRHHPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Recursos humanos</h1><p className="text-slate-500 dark:text-slate-400">Equipo interno y asignación de responsabilidades.</p></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{equipo.map((m) => <div key={m.nombre} className="card"><h3 className="font-semibold text-slate-900 dark:text-white">{m.nombre}</h3><p className="text-sm text-slate-500 dark:text-slate-400">{m.area}</p><p className="text-sm text-slate-500 dark:text-slate-400">{m.rol}</p><p className="text-sm text-slate-500 dark:text-slate-400">Carga: {m.carga}</p></div>)}</div>
    </div>
  );
}
