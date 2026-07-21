"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts";

interface Props {
  completadas: number;
  pendientes: number;
  enProgreso: number;
  vencidas: number;
}

const COLORES = {
  pendientes: "#3b66f5",
  enProgreso: "#f59e0b",
  completadas: "#10b981",
  vencidas: "#ef4444",
};

const DATOS_CONFIG: { key: keyof typeof COLORES; label: string }[] = [
  { key: "pendientes", label: "Pendientes" },
  { key: "enProgreso", label: "En progreso" },
  { key: "completadas", label: "Completadas" },
  { key: "vencidas", label: "Vencidas" },
];

export default function StatusDistribution({
  completadas,
  pendientes,
  enProgreso,
  vencidas,
}: Props) {
  const valores = { pendientes, enProgreso, completadas, vencidas };
  const total = Object.values(valores).reduce((a, b) => a + b, 0);

  const datos = DATOS_CONFIG.map(({ key, label }) => ({
    name: label,
    valor: valores[key],
    color: COLORES[key],
  })).filter((d) => d.valor > 0);

  if (total === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
          Distribución de actividades
        </h3>
        <p className="mt-4 text-sm text-slate-400">
          No hay actividades registradas.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">
        Distribución de actividades
      </h3>
      <div className="flex flex-col items-center">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={datos}
                dataKey="valor"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {datos.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `${value} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
                  "",
                ]}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={40}
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 grid w-full grid-cols-2 gap-2 text-center text-xs text-slate-500 dark:text-slate-400">
          {DATOS_CONFIG.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: COLORES[key] }}
              />
              <span>
                {label}: {valores[key]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
