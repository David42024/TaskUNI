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
  FunnelChart,
  Funnel,
  LabelList,
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
} from "lucide-react";
import clsx from "clsx";

// Datos mock existentes + campos adicionales
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

// Datos para el gráfico de líneas (evolución de leads)
const leadsPorPeriodo = [
  { nombre: "Ene", leads: 120 },
  { nombre: "Feb", leads: 180 },
  { nombre: "Mar", leads: 220 },
  { nombre: "Abr", leads: 280 },
  { nombre: "May", leads: 310 },
  { nombre: "Jun", leads: 340 },
];

// Datos para el gráfico de dona (distribución por canal)
const distribucionCanal = [
  { nombre: "Instagram", value: 40, color: "#6366f1" },
  { nombre: "TikTok", value: 35, color: "#06b6d4" },
  { nombre: "SEO", value: 15, color: "#22c55e" },
  { nombre: "Convenios", value: 10, color: "#f59e0b" },
];

// Datos para el embudo de conversión
const embudoConversión = [
  { nombre: "Alcance", value: 63000 },
  { nombre: "Clicks", value: 8400 },
  { nombre: "Registros", value: 1260 },
  { nombre: "Usuarios", value: 840 },
  { nombre: "Premium", value: 252 },
];

const canales = ["Todos", "Instagram", "TikTok", "SEO", "Convenios"] as const;
const periodos = ["Hoy", "Semana", "Mes", "Año"] as const;

const colorEstado: Record<string, string> = {
  Activa: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  Pausada: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  Finalizada: "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-200",
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

export default function AdminMarketingPage() {
  const [periodo, setPeriodo] = useState<(typeof periodos)[number]>("Mes");
  const [canal, setCanal] = useState<(typeof canales)[number]>("Todos");

  // Filtrar campañas (solo visual)
  const campañasFiltradas = useMemo(() => {
    return campañasOriginales.filter(
      (c) => canal === "Todos" || c.canal === canal
    );
  }, [canal]);

  // Calcular KPIs (suma basada en datos mock)
  const kpis = useMemo(() => {
    const totalCampañasActivas = campañasFiltradas.filter(
      (c) => c.estado === "Activa"
    ).length;
    const totalLeads = campañasFiltradas.reduce((sum, c) => sum + c.leads, 0);
    const promedioConversion = campañasFiltradas.length
      ? campañasFiltradas.reduce((sum, c) => sum + c.conversionNum, 0) /
        campañasFiltradas.length
      : 0;
    const costoPorLead = 45; // Dato mock

    return {
      totalCampañasActivas,
      totalLeads,
      promedioConversion,
      costoPorLead,
    };
  }, [campañasFiltradas]);

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Marketing
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Campañas y captación digital para TaskUni.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            {periodos.map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                className={clsx(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                  periodo === p
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={canal}
            onChange={(e) => setCanal(e.target.value as any)}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {canales.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Campañas activas
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {kpis.totalCampañasActivas}
              </p>
            </div>
            <div className="p-2 bg-brand-100 dark:bg-brand-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Leads generados
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {kpis.totalLeads}
              </p>
            </div>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg">
              <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Conversión promedio
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {kpis.promedioConversion.toFixed(1)}%
              </p>
            </div>
            <div className="p-2 bg-cyan-100 dark:bg-cyan-500/10 rounded-lg">
              <Target className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Costo por lead
              </p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                S/ {kpis.costoPorLead}
              </p>
            </div>
            <div className="p-2 bg-amber-100 dark:bg-amber-500/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico de líneas: Evolución de leads */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Evolución de leads
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leadsPorPeriodo}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e2e8f0"
                  className="dark:stroke-slate-700"
                />
                <XAxis
                  dataKey="nombre"
                  stroke="#64748b"
                  className="dark:stroke-slate-400"
                />
                <YAxis
                  stroke="#64748b"
                  className="dark:stroke-slate-400"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#1e293b" }}
                />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#6366f1" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de dona: Distribución por canal */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Distribución por canal
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribucionCanal}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distribucionCanal.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="nombre"
                    position="outside"
                    className="text-sm text-slate-700 dark:text-slate-300"
                  />
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Embudo de conversión */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Embudo de conversión
          </h3>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <FunnelChart>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              />
              <Funnel data={embudoConversión} dataKey="value">
                <LabelList
                  position="right"
                  fill="#1e293b"
                  stroke="none"
                  dataKey="nombre"
                  className="dark:fill-slate-100"
                />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de campañas */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Campaña
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Alcance
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Leads
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Conversión
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Responsable
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {campañasFiltradas.map((campaña) => {
                const IconCanal = iconoCanal[campaña.canal];
                const IconEstado = iconoEstado[campaña.estado];
                return (
                  <tr
                    key={campaña.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                          <IconCanal className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {campaña.nombre}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={clsx(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                          colorEstado[campaña.estado]
                        )}
                      >
                        <IconEstado className="w-3 h-3" />
                        {campaña.estado}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {campaña.alcance}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {campaña.leads}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {campaña.conversion}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
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