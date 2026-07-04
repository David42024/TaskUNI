const campañas = [
  { nombre: "Instagram Ads", alcance: "18k", leads: 240, conversion: "6.4%" },
  { nombre: "TikTok Shorts", alcance: "22k", leads: 310, conversion: "7.8%" },
  { nombre: "SEO académico", alcance: "14k", leads: 170, conversion: "5.1%" },
  { nombre: "Convenios universitarios", alcance: "9k", leads: 120, conversion: "8.9%" },
];

export default function AdminMarketingPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Marketing</h1><p className="text-slate-500 dark:text-slate-400">Campañas y captación digital para TaskUni.</p></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{campañas.map((c) => <div key={c.nombre} className="card"><h3 className="font-semibold text-slate-900 dark:text-white">{c.nombre}</h3><p className="text-sm text-slate-500 dark:text-slate-400">Alcance: {c.alcance}</p><p className="text-sm text-slate-500 dark:text-slate-400">Leads: {c.leads}</p><p className="text-sm text-slate-500 dark:text-slate-400">Conversión: {c.conversion}</p></div>)}</div>
    </div>
  );
}
