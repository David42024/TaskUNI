"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Instagram,
  Music,
  Search,
  Building2,
  Calendar,
  Filter,
  PlayCircle,
  PauseCircle,
  CheckCircle,
  Megaphone,
  BarChart3,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import clsx from "clsx";

const campañasOriginales = [
  {
    id: 1,
    nombre: "Instagram Ads",
    alcance: "18k",
    alcanceNum: 18000,
    leads: 240,
    conversion: "6.4%",
    conversionNum: 6.4,
    estado: "Activa" as const,
    responsable: "María Santos",
    canal: "Instagram" as const,
  },
  {
    id: 2,
    nombre: "TikTok Shorts",
    alcance: "22k",
    alcanceNum: 22000,
    leads: 310,
    conversion: "7.8%",
    conversionNum: 7.8,
    estado: "Activa" as const,
    responsable: "María Santos",
    canal: "TikTok" as const,
  },
  {
    id: 3,
    nombre: "SEO académico",
    alcance: "14k",
    alcanceNum: 14000,
    leads: 170,
    conversion: "5.1%",
    conversionNum: 5.1,
    estado: "Pausada" as const,
    responsable: "Jorge Pérez",
    canal: "SEO" as const,
  },
  {
    id: 4,
    nombre: "Convenios universitarios",
    alcance: "9k",
    alcanceNum: 9000,
    leads: 120,
    conversion: "8.9%",
    conversionNum: 8.9,
    estado: "Finalizada" as const,
    responsable: "David Gómez",
    canal: "Convenios" as const,
  },
];

const leadsPorPeriodo = [
  { nombre: "Ene", leads: 120 },
  { nombre: "Feb", leads: 180 },
  { nombre: "Mar", leads: 220 },
  { nombre: "Abr", leads: 280 },
  { nombre: "May", leads: 310 },
  { nombre: "Jun", leads: 340 },
];

const distribucionCanal = [
  { nombre: "Instagram", value: 40, color: "#6366f1" },
  { nombre: "TikTok", value: 35, color: "#06b6d4" },
  { nombre: "SEO", value: 15, color: "#22c55e" },
  { nombre: "Convenios", value: 10, color: "#f59e0b" },
];

const embudoConversión = [
  { nombre: "Alcance", value: 63000 },
  { nombre: "Clicks", value: 8400 },
  { nombre: "Registros", value: 1260 },
  { nombre: "Usuarios", value: 840 },
  { nombre: "Premium", value: 252 },
];

const embudoColores = [
  "from-brand-500 to-brand-600",
  "from-cyan-500 to-cyan-600",
  "from-emerald-500 to-emerald-600",
  "from-amber-500 to-amber-600",
  "from-rose-500 to-rose-600",
];

const embudoColoresLight = [
  "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
  "bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300",
  "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
];

const canales = ["Todos", "Instagram", "TikTok", "SEO", "Convenios"] as const;
const periodos = ["Hoy", "Semana", "Mes", "Año"] as const;

const colorEstado: Record<string, string> = {
  Activa: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
  Pausada: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
  Finalizada: "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-white/10 dark:text-slate-400 dark:border-white/10",
};

const iconoCanal: Record<string, any> = {
  Instagram: Instagram,
  TikTok: Music,
  SEO: Search,
  Convenios: Building2,
};

const iconoEstado: Record<string, any> = {
  Activa: PlayCircle,
  Pausada: PauseCircle,
  Finalizada: CheckCircle,
};

const canalColorBg: Record<string, string> = {
  Instagram: "bg-indigo-100 dark:bg-indigo-500/15",
  TikTok: "bg-cyan-100 dark:bg-cyan-500/15",
  SEO: "bg-emerald-100 dark:bg-emerald-500/15",
  Convenios: "bg-amber-100 dark:bg-amber-500/15",
};

const canalColorText: Record<string, string> = {
  Instagram: "text-indigo-600 dark:text-indigo-400",
  TikTok: "text-cyan-600 dark:text-cyan-400",
  SEO: "text-emerald-600 dark:text-emerald-400",
  Convenios: "text-amber-600 dark:text-amber-400",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl dark:border-white/10 dark:bg-slate-900">
      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
        {payload[0].value.toLocaleString("es-PE")} leads
      </p>
    </div>
  );
}

export default function AdminMarketingPage() {
  const [periodo, setPeriodo] = useState<(typeof periodos)[number]>("Mes");
  const [canal, setCanal] = useState<(typeof canales)[number]>("Todos");

  const campañasFiltradas = useMemo(() => {
    return campañasOriginales.filter(
      (c) => canal === "Todos" || c.canal === canal
    );
  }, [canal]);

  const kpis = useMemo(() => {
    const totalCampañasActivas = campañasFiltradas.filter(
      (c) => c.estado === "Activa"
    ).length;
    const totalLeads = campañasFiltradas.reduce((sum, c) => sum + c.leads, 0);
    const promedioConversion = campañasFiltradas.length
      ? campañasFiltradas.reduce((sum, c) => sum + c.conversionNum, 0) /
        campañasFiltradas.length
      : 0;
    const costoPorLead = 45;

    return {
      totalCampañasActivas,
      totalLeads,
      promedioConversion,
      costoPorLead,
    };
  }, [campañasFiltradas]);

  const maxEmbudo = embudoConversión[0].value;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          <Megaphone size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Marketing
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Campañas y captación digital para TaskUni.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-white/5">
            {periodos.map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={clsx(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200",
                  periodo === p
                    ? "bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={canal}
            onChange={(e) => setCanal(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            {canales.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card group flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 shadow-sm dark:bg-brand-500/15 dark:text-brand-300">
            <TrendingUp size={22} className="transition-transform duration-300 group-hover:scale-110" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Campañas activas
            </p>
            <div className="mt-0.5 flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {kpis.totalCampañasActivas}
              </p>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <ArrowUpRight size={10} />
                +2
              </span>
            </div>
          </div>
        </div>

        <div className="card group flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-sm dark:bg-emerald-500/15 dark:text-emerald-300">
            <Users size={22} className="transition-transform duration-300 group-hover:scale-110" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Leads generados
            </p>
            <div className="mt-0.5 flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {kpis.totalLeads.toLocaleString("es-PE")}
              </p>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <ArrowUpRight size={10} />
                +18%
              </span>
            </div>
          </div>
        </div>

        <div className="card group flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 shadow-sm dark:bg-cyan-500/15 dark:text-cyan-300">
            <Target size={22} className="transition-transform duration-300 group-hover:scale-110" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Conversión promedio
            </p>
            <div className="mt-0.5 flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {kpis.promedioConversion.toFixed(1)}%
              </p>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <ArrowUpRight size={10} />
                +0.4
              </span>
            </div>
          </div>
        </div>

        <div className="card group flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shadow-sm dark:bg-amber-500/15 dark:text-amber-300">
            <DollarSign size={22} className="transition-transform duration-300 group-hover:scale-110" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Costo por lead
            </p>
            <div className="mt-0.5 flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                S/ {kpis.costoPorLead}
              </p>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <ArrowDownRight size={10} />
                -5
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              <BarChart3 size={16} />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Evolución de leads
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leadsPorPeriodo}>
                <defs>
                  <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                  vertical={false}
                  className="dark:stroke-white/5"
                />
                <XAxis
                  dataKey="nombre"
                  stroke="transparent"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                />
                <YAxis
                  stroke="transparent"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#leadsGradient)"
                  dot={{ r: 0, fill: "#6366f1", strokeWidth: 0 }}
                  activeDot={{
                    r: 6,
                    fill: "#6366f1",
                    stroke: "white",
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-300">
              <Zap size={16} />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Distribución por canal
            </h3>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-56 w-56 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribucionCanal}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {distribucionCanal.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                      padding: "8px 12px",
                    }}
                    formatter={(value: number) => [`${value}%`, "Participación"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-3">
              {distribucionCanal.map((entry) => (
                <div key={entry.nombre} className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {entry.nombre}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {entry.value}%
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${entry.value}%`,
                          backgroundColor: entry.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
            <TrendingUp size={16} />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Embudo de conversión
          </h3>
        </div>
        <div className="space-y-3">
          {embudoConversión.map((etapa, i) => {
            const porcentaje = ((etapa.value / maxEmbudo) * 100).toFixed(1);
            const tasaConversion =
              i > 0
                ? ((etapa.value / embudoConversión[i - 1].value) * 100).toFixed(1)
                : "100.0";

            return (
              <div key={etapa.nombre} className="group">
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={clsx(
                        "inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-bold",
                        embudoColoresLight[i]
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {etapa.nombre}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {etapa.value.toLocaleString("es-PE")}
                    </span>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                      {porcentaje}%
                    </span>
                    {i > 0 && (
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-400">
                        {tasaConversion}% paso
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-8 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-white/5">
                  <div
                    className={clsx(
                      "h-full rounded-xl bg-gradient-to-r transition-all duration-700 ease-out",
                      embudoColores[i]
                    )}
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
              <Megaphone size={16} />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Campañas
            </h3>
            <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-white/10 dark:text-slate-400">
              {campañasFiltradas.length} registros
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Campaña
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Estado
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Alcance
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Leads
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Conversión
                </th>
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Responsable
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {campañasFiltradas.map((campaña) => {
                const IconCanal = iconoCanal[campaña.canal];
                const IconEstado = iconoEstado[campaña.estado];
                return (
                  <tr
                    key={campaña.id}
                    className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={clsx(
                            "flex h-9 w-9 items-center justify-center rounded-lg",
                            canalColorBg[campaña.canal]
                          )}
                        >
                          <IconCanal
                            className={clsx(
                              "h-4 w-4",
                              canalColorText[campaña.canal]
                            )}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 group-hover:text-slate-900 dark:text-white">
                            {campaña.nombre}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={clsx(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                          colorEstado[campaña.estado]
                        )}
                      >
                        <IconEstado className="h-3 w-3" />
                        {campaña.estado}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                      {campaña.alcance}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-semibold text-slate-800 dark:text-white">
                        {campaña.leads}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2 py-1 text-sm font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                        {campaña.conversion}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {campaña.responsable}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
