"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Props {
  completadas: number;
  pendientes: number;
  vencidas: number;
  enProgreso: number;
}

const COLORES = ["#3b66f5", "#f59e0b", "#ef4444", "#10b981"];

export default function GraficoProductividad({ completadas, pendientes, vencidas, enProgreso }: Props) {
  const datos = [
    { nombre: "Pendientes", valor: pendientes },
    { nombre: "En progreso", valor: enProgreso },
    { nombre: "Completadas", valor: completadas },
    { nombre: "Vencidas", valor: vencidas },
  ];

  return (
    <div className="card">
      <h3 className="mb-4 text-lg font-semibold text-slate-800">Productividad académica</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                {datos.map((_, index) => (
                  <Cell key={index} fill={COLORES[index % COLORES.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={datos}
                dataKey="valor"
                nameKey="nombre"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={3}
              >
                {datos.map((_, index) => (
                  <Cell key={index} fill={COLORES[index % COLORES.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={24} wrapperStyle={{ fontSize: 11 }} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
