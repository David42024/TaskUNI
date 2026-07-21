"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface Tarea {
  id_tarea: string;
  estado_tarea: string;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  fecha_limite: Date | null;
  completedAt?: Date | null;
}

interface Props {
  tareas: Tarea[];
}

type DataPoint = {
  label: string;
  planificadas: number;
  completadas: number;
  cumplimiento: number;
};

function generarDatos(tareas: Tarea[]): DataPoint[] {
  const ahora = new Date();
  const dias: DataPoint[] = [];

  for (let i = 6; i >= 0; i--) {
    const dia = new Date(ahora.getTime() - i * 24 * 60 * 60 * 1000);
    const diaStr = dia.toLocaleDateString("es-PE", {
      weekday: "short",
      day: "numeric",
    });

    const diaSiguiente = new Date(dia.getTime() + 24 * 60 * 60 * 1000);
    const delDia = tareas.filter((t) => {
      const creada = new Date(t.fecha_creacion);
      return creada >= dia && creada < diaSiguiente;
    });
    const completadasHoy = tareas.filter((t) => {
      const completadaEn = t.completedAt
        ? new Date(t.completedAt)
        : t.estado_tarea === "completada"
          ? new Date(t.fecha_actualizacion)
          : null;
      return (
        completadaEn !== null &&
        completadaEn >= dia &&
        completadaEn < diaSiguiente
      );
    });

    const total = delDia.length + completadasHoy.length;
    dias.push({
      label: diaStr,
      planificadas: delDia.length,
      completadas: completadasHoy.length,
      cumplimiento: total > 0 ? Math.round((completadasHoy.length / total) * 100) : 0,
    });
  }

  return dias;
}

export default function TrendChart({ tareas }: Props) {
  const datos = generarDatos(tareas);

  if (datos.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
          Tendencia de cumplimiento
        </h3>
        <p className="mt-4 text-sm text-slate-400">
          No hay datos suficientes para mostrar la tendencia.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">
        Tendencia de cumplimiento
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datos}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              stroke="#94a3b8"
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11 }}
              stroke="#94a3b8"
              allowDecimals={false}
              label={{ value: "Tareas", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#94a3b8" } }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11 }}
              stroke="#94a3b8"
              domain={[0, 100]}
              label={{ value: "% Cumplimiento", angle: 90, position: "insideRight", style: { fontSize: 11, fill: "#94a3b8" } }}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e2e8f0",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={28}
              wrapperStyle={{ fontSize: 11 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="completadas"
              name="Completadas"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="planificadas"
              name="Planificadas"
              stroke="#3b66f5"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumplimiento"
              name="Cumplimiento %"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3 }}
              strokeDasharray="4 2"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
