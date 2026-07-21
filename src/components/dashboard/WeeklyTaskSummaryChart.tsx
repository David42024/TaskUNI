"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

interface Props {
  pendientes: number;
  enProgreso: number;
  completadas: number;
  vencidas: number;
}

const COLORES: Record<string, string> = {
  Pendientes: "#3b66f5",
  "En progreso": "#f59e0b",
  Completadas: "#10b981",
  Vencidas: "#ef4444",
};

export default function WeeklyTaskSummaryChart({
  pendientes,
  enProgreso,
  completadas,
  vencidas,
}: Props) {
  const datos = [
    { nombre: "Pendientes", valor: pendientes, fill: COLORES.Pendientes },
    { nombre: "En progreso", valor: enProgreso, fill: COLORES["En progreso"] },
    { nombre: "Completadas", valor: completadas, fill: COLORES.Completadas },
    { nombre: "Vencidas", valor: vencidas, fill: COLORES.Vencidas },
  ];

  const total = pendientes + enProgreso + completadas + vencidas;

  if (total === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
          Resumen semanal
        </h3>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Estado actual de tus tareas.
        </p>
        <p className="mt-6 text-sm text-slate-400">
          No hay tareas registradas esta semana.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
        Resumen semanal
      </h3>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
        Estado actual de tus tareas durante esta semana.
      </p>
      <div className="mt-4 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={datos} barCategoryGap="24%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="nombre"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e2e8f0",
              }}
              formatter={(value: number) => [value, "Tareas"]}
            />
            <Bar dataKey="valor" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {datos.map((entry) => (
                <Cell key={entry.nombre} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
