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

interface Tarea {
  id_tarea: string;
  fecha_limite: Date | null;
}

interface Evento {
  id_evento: string;
  fecha_inicio: Date;
}

interface Props {
  tareas: Tarea[];
  eventos: Evento[];
}

type DiaData = {
  label: string;
  dia: string;
  actividades: number;
  fill: string;
};

const nombresDias = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

export default function UpcomingLoadChart({ tareas, eventos }: Props) {
  const hoy = new Date();
  const dias: DiaData[] = [];

  for (let i = 0; i < 7; i++) {
    const dia = new Date(hoy.getTime() + i * 24 * 60 * 60 * 1000);
    const diaSiguiente = new Date(dia.getTime() + 24 * 60 * 60 * 1000);
    const diaSemana = dia.getDay();

    const tareasDelDia = tareas.filter((t) => {
      if (!t.fecha_limite) return false;
      const fl = new Date(t.fecha_limite);
      return fl >= dia && fl < diaSiguiente;
    }).length;

    const eventosDelDia = eventos.filter((ev) => {
      const fi = new Date(ev.fecha_inicio);
      return fi >= dia && fi < diaSiguiente;
    }).length;

    const label = i === 0 ? "Hoy" : i === 1 ? "Mañana" : nombresDias[diaSemana];

    dias.push({
      label,
      dia: dia.toLocaleDateString("es-PE", { weekday: "short", day: "numeric" }),
      actividades: tareasDelDia + eventosDelDia,
      fill: i === 0 ? "#3b66f5" : "#93b3fd",
    });
  }

  const maxAct = Math.max(...dias.map((d) => d.actividades), 1);
  const totalProxima = dias.reduce((s, d) => s + d.actividades, 0);

  if (totalProxima === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
          Carga de entregas próximas
        </h3>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Actividades programadas para los próximos días.
        </p>
        <p className="mt-6 text-sm text-slate-400">
          No hay entregas ni eventos programados aún.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            Carga de entregas próximas
          </h3>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {totalProxima} actividad{totalProxima !== 1 ? "es" : ""} en los
            próximos 7 días
          </p>
        </div>
      </div>
      <div className="mt-4 h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dias} barCategoryGap="20%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              allowDecimals={false}
              domain={[0, maxAct + 1]}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e2e8f0",
              }}
              formatter={(value: number) => [value, "Actividades"]}
              labelFormatter={(label: string) => {
                const d = dias.find((x) => x.label === label);
                return d ? d.dia : label;
              }}
            />
            <Bar
              dataKey="actividades"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            >
              {dias.map((entry) => (
                <Cell key={entry.dia} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
