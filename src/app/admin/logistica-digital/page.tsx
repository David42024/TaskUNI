"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Server,
  Database,
  Shield,
  Mail,
  HardDrive,
  HardDriveDownload,
  Cpu,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Zap,
  Download,
} from "lucide-react";
import clsx from "clsx";

// Datos mock existentes + expandidos
const kpisOriginales = [
  { nombre: "Plataforma web", valor: "99.9%", detalle: "Uptime" },
  { nombre: "Último backup", valor: "Hoy 02:00", detalle: "Respaldo en nube" },
  { nombre: "Servicios activos", valor: "12", detalle: "API, DB, Auth, Analytics" },
  { nombre: "Incidencias abiertas", valor: "2", detalle: "Seguimiento operativo" },
  { nombre: "Tiempo respuesta", valor: "18 min", detalle: "Soporte técnico" },
  { nombre: "Usuarios conectados", valor: "248", detalle: "Sesiones activas" },
];

// Estado de servicios
const estadoServicios: Array<{
  id: number;
  nombre: string;
  estado: string;
  icono: any;
  latencia: string;
  nota: string;
}> = [
  {
    id: 1,
    nombre: "API",
    estado: "operativo",
    icono: Server,
    latencia: "18ms",
    nota: "Respuesta dentro de los límites aceptables",
  },
  {
    id: 2,
    nombre: "Base de datos",
    estado: "operativo",
    icono: Database,
    latencia: "5ms",
    nota: "Respuesta instantánea",
  },
  {
    id: 3,
    nombre: "Autenticación",
    estado: "operativo",
    icono: Shield,
    latencia: "12ms",
    nota: "Sesiones verificadas correctamente",
  },
  {
    id: 4,
    nombre: "Correo",
    estado: "advertencia",
    icono: Mail,
    latencia: "2.1s",
    nota: "Cola con 1,200 emails pendientes de envío",
  },
  {
    id: 5,
    nombre: "Backups",
    estado: "operativo",
    icono: HardDrive,
    latencia: "N/A",
    nota: "Último backup completo hoy 02:00",
  },
  {
    id: 6,
    nombre: "Storage",
    estado: "error",
    icono: HardDriveDownload,
    latencia: "N/A",
    nota: "Error de conexión con S3: Credenciales expiradas",
  },
];

// Datos para gráfico de disponibilidad (últimos 30 días)
const disponibilidad30Dias = Array.from({ length: 30 }, (_, i) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - (29 - i));
  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1;
  return {
    fecha: `${dia}/${mes}`,
    disponibilidad: 99 + Math.random() * 1,
  };
});

// Datos para gráfico de incidencias
const incidenciasPorDia = Array.from({ length: 30 }, (_, i) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - (29 - i));
  const dia = fecha.getDate();
  const mes = fecha.getMonth() + 1;
  return {
    fecha: `${dia}/${mes}`,
    incidencias: Math.floor(Math.random() * 5),
  };
});

// Metricas de recursos
const metricasRecursos = [
  { nombre: "CPU", valor: 45, color: "brand" },
  { nombre: "RAM", valor: 72, color: "cyan" },
  { nombre: "Storage", valor: 88, color: "amber" },
  { nombre: "Usuarios conectados", valor: 68, color: "emerald" },
];

// Actividad reciente
const actividadReciente = [
  {
    id: 1,
    tipo: "backup",
    mensaje: "Backup completado exitosamente",
    fecha: "Hace 2h",
    usuario: "Sistema",
  },
  {
    id: 2,
    tipo: "sincronizacion",
    mensaje: "Servidores sincronizados correctamente",
    fecha: "Hace 4h",
    usuario: "Admin",
  },
  {
    id: 3,
    tipo: "reinicio",
    mensaje: "API reiniciada - Deploy v2.1.0",
    fecha: "Hace 6h",
    usuario: "DevOps",
  },
  {
    id: 4,
    tipo: "incidencia",
    mensaje: "Nueva incidencia: Storage - Latencia alta",
    fecha: "Hace 8h",
    usuario: "Monitoreo",
  },
  {
    id: 5,
    tipo: "recuperacion",
    mensaje: "Servicio de Auth recuperado",
    fecha: "Hace 12h",
    usuario: "Sistema",
  },
  {
    id: 6,
    tipo: "backup",
    mensaje: "Backup incremental realizado",
    fecha: "Ayer 02:00",
    usuario: "Sistema",
  },
];

// Colores de estado
const colorEstado: Record<string, string> = {
  operativo: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
  advertencia: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
  error: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-200",
};

const iconoEstado: Record<string, any> = {
  operativo: CheckCircle,
  advertencia: AlertTriangle,
  error: Zap,
};

// Colores para barras de progreso
const colorProgreso: Record<string, string> = {
  brand: "bg-brand-500",
  cyan: "bg-cyan-500",
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
};

const iconoActividad: Record<string, any> = {
  backup: Download,
  sincronizacion: RefreshCw,
  reinicio: Server,
  incidencia: AlertTriangle,
  recuperacion: CheckCircle,
};

export default function AdminLogisticaPage() {
  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Logística digital
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Operación, nube, backups y disponibilidad del sistema.
        </p>
      </div>

      {/* KPIs principales */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kpisOriginales.map((kpi) => (
          <div key={kpi.nombre} className="card">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {kpi.detalle}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {kpi.valor}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {kpi.nombre}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Panel de estado de servicios */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Estado de servicios
              </h3>
            </div>
            <div className="space-y-3">
              {estadoServicios.map((servicio) => {
                const Icono = servicio.icono;
                const EstadoIcono = iconoEstado[servicio.estado];
                return (
                  <div
                    key={servicio.id}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                          <Icono className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {servicio.nombre}
                          </p>
                          {servicio.latencia !== "N/A" && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Latencia: {servicio.latencia}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                            colorEstado[servicio.estado]
                          )}
                        >
                          <EstadoIcono className="w-3 h-3" />
                          {servicio.estado === "operativo"
                            ? "Operativo"
                            : servicio.estado === "advertencia"
                            ? "Advertencia"
                            : "Error"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {servicio.nota}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gráfico de disponibilidad */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Disponibilidad (últimos 30 días)
              </h3>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={disponibilidad30Dias}>
                  <defs>
                    <linearGradient id="colorDisponibilidad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    className="dark:stroke-slate-700"
                  />
                  <XAxis
                    dataKey="fecha"
                    stroke="#64748b"
                    className="dark:stroke-slate-400"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value, index) =>
                      index % 7 === 0 ? value : ""
                    }
                  />
                  <YAxis
                    stroke="#64748b"
                    className="dark:stroke-slate-400"
                    domain={[98, 100]}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#1e293b" }}
                    formatter={(value: number) => [`${value.toFixed(2)}%`, "Disponibilidad"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="disponibilidad"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorDisponibilidad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de incidencias */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Incidencias (últimos 30 días)
              </h3>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={incidenciasPorDia}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    className="dark:stroke-slate-700"
                  />
                  <XAxis
                    dataKey="fecha"
                    stroke="#64748b"
                    className="dark:stroke-slate-400"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value, index) =>
                      index % 7 === 0 ? value : ""
                    }
                  />
                  <YAxis
                    stroke="#64748b"
                    className="dark:stroke-slate-400"
                    tick={{ fontSize: 12 }}
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
                    dataKey="incidencias"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#f59e0b" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Barras de progreso de recursos */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Uso de recursos
            </h3>
          </div>
          <div className="space-y-5">
            {metricasRecursos.map((metrica) => (
              <div key={metrica.nombre}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {metrica.nombre}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {metrica.valor}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div
                    className={clsx("h-3 rounded-full transition-all duration-500", colorProgreso[metrica.color])}
                    style={{ width: `${metrica.valor}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabla de actividad reciente */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Actividad reciente
            </h3>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {actividadReciente.map((item) => {
              const Icono = iconoActividad[item.tipo];
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="p-2 bg-brand-100 dark:bg-brand-500/10 rounded-lg flex-shrink-0">
                    <Icono className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {item.mensaje}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Por {item.usuario}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {item.fecha}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
