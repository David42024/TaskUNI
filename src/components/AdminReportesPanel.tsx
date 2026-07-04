"use client";

import { useMemo, useState } from "react";
import { Download, Printer, RotateCcw, Users, Crown, DollarSign, ListChecks, FolderKanban, LifeBuoy, FileText } from "lucide-react";

type ReportType = "usuarios" | "suscripciones-pagos" | "academico" | "soporte" | "ejecutivo";
type FormatType = "pantalla" | "csv" | "pdf";

type AdminReportData = {
  usuarios: Array<{ nombres: string; apellidos: string; correo: string; rol: string; estado: string; fecha_registro: string; plan: string }>;
  suscripciones: Array<{ usuario: string; plan: string; tipo_plan: string; estado_suscripcion: string; fecha_inicio: string }>;
  pagos: Array<{ usuario: string; plan: string; monto: number; metodo_pago: string; estado_pago: string; fecha_pago: string }>;
  tareas: Array<{ titulo: string; estado_tarea: string; prioridad: string; usuario: string; curso: string; fecha_limite: string | null }>;
  proyectos: Array<{ nombre_proyecto: string; estado_proyecto: string; creador: string; curso: string; integrantes: number; tareas: number; fecha_creacion: string }>;
  cursos: Array<{ nombre_curso: string; docente: string; usuario: string; estado: string }>;
  soporte: Array<{ asunto: string; estado_consulta: string; usuario: string; fecha_envio: string }>;
  reportes: Array<{ periodo: string; porcentaje_cumplimiento: number; racha_productividad: number; total_tareas: number; tareas_completadas: number; tareas_pendientes: number; tareas_vencidas: number; fecha_generacion: string; usuario: string }>;
  resumen: { totalUsuarios: number; usuariosPremium: number; ingresosEstimados: number; totalTareas: number; totalProyectos: number; consultasPendientes: number };
  generadoPor: string;
};

type Props = {
  data: AdminReportData;
  generadoEn: string;
};

const labels: Record<ReportType, string> = {
  usuarios: "Reporte de usuarios",
  "suscripciones-pagos": "Reporte de suscripciones y pagos",
  academico: "Reporte académico de uso",
  soporte: "Reporte de soporte",
  ejecutivo: "Reporte ejecutivo del e-Business",
};

function money(value: number) {
  return `S/ ${value.toFixed(2)}`;
}

function createCsv(rows: Record<string, string | number>[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
}

function inRange(dateValue: string | null, start: string, end: string) {
  if (!dateValue) return true;
  const date = new Date(dateValue);
  const from = start ? new Date(`${start}T00:00:00`) : null;
  const to = end ? new Date(`${end}T23:59:59`) : null;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "America/Lima",
  }).format(new Date(value));
}

export default function AdminReportesPanel({ data, generadoEn }: Props) {
  const [tipoReporte, setTipoReporte] = useState<ReportType>("ejecutivo");
  const [formato, setFormato] = useState<FormatType>("pantalla");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [generado, setGenerado] = useState(false);
  const [fechaGeneracion, setFechaGeneracion] = useState(generadoEn);

  const filtrado = useMemo(() => {
    return {
      usuarios: data.usuarios.filter((item) => inRange(item.fecha_registro, fechaInicio, fechaFin)),
      suscripciones: data.suscripciones.filter((item) => inRange(item.fecha_inicio, fechaInicio, fechaFin)),
      pagos: data.pagos.filter((item) => inRange(item.fecha_pago, fechaInicio, fechaFin)),
      tareas: data.tareas.filter((item) => inRange(item.fecha_limite, fechaInicio, fechaFin)),
      proyectos: data.proyectos.filter((item) => inRange(item.fecha_creacion, fechaInicio, fechaFin)),
      cursos: data.cursos,
      soporte: data.soporte.filter((item) => inRange(item.fecha_envio, fechaInicio, fechaFin)),
      reportes: data.reportes.filter((item) => inRange(item.fecha_generacion, fechaInicio, fechaFin)),
    };
  }, [data, fechaFin, fechaInicio]);

  const rows = useMemo(() => {
    switch (tipoReporte) {
      case "usuarios":
        return filtrado.usuarios.map((item) => ({
          Usuario: `${item.nombres} ${item.apellidos}`,
          Correo: item.correo,
          Rol: item.rol,
          Estado: item.estado,
          Plan: item.plan,
          Registro: item.fecha_registro.slice(0, 10),
        }));
      case "suscripciones-pagos":
        return [
          ...filtrado.suscripciones.map((item) => ({
            Tipo: "Suscripción",
            Usuario: item.usuario,
            Plan: item.plan,
            Estado: item.estado_suscripcion,
            Fecha: item.fecha_inicio.slice(0, 10),
          })),
          ...filtrado.pagos.map((item) => ({
            Tipo: "Pago",
            Usuario: item.usuario,
            Plan: item.plan,
            Estado: item.estado_pago,
            Monto: money(item.monto),
            Método: item.metodo_pago,
            Fecha: item.fecha_pago.slice(0, 10),
          })),
        ];
      case "academico":
        return [
          ...filtrado.tareas.map((item) => ({
            Tipo: "Tarea",
            Titulo: item.titulo,
            Estado: item.estado_tarea,
            Prioridad: item.prioridad,
            Usuario: item.usuario,
            Curso: item.curso,
          })),
          ...filtrado.proyectos.map((item) => ({
            Tipo: "Proyecto",
            Titulo: item.nombre_proyecto,
            Estado: item.estado_proyecto,
            Usuario: item.creador,
            Curso: item.curso,
            Integrantes: item.integrantes,
            Tareas: item.tareas,
          })),
        ];
      case "soporte":
        return filtrado.soporte.map((item) => ({
          Asunto: item.asunto,
          Estado: item.estado_consulta,
          Usuario: item.usuario,
          Fecha: item.fecha_envio.slice(0, 10),
        }));
      case "ejecutivo":
      default:
        return [
          { Métrica: "Usuarios registrados", Valor: data.resumen.totalUsuarios },
          { Métrica: "Usuarios Premium", Valor: data.resumen.usuariosPremium },
          { Métrica: "Ingresos estimados", Valor: money(data.resumen.ingresosEstimados) },
          { Métrica: "Tareas creadas", Valor: data.resumen.totalTareas },
          { Métrica: "Proyectos activos", Valor: data.resumen.totalProyectos },
          { Métrica: "Consultas pendientes", Valor: data.resumen.consultasPendientes },
        ];
    }
  }, [data.resumen, filtrado, tipoReporte]);

  const metrics = useMemo(() => {
    if (tipoReporte === "usuarios") {
      return [
        { label: "Usuarios", value: filtrado.usuarios.length, icon: Users, tone: "brand" },
        { label: "Activos", value: filtrado.usuarios.filter((item) => item.estado === "activo").length, icon: Users, tone: "green" },
        { label: "Suspendidos", value: filtrado.usuarios.filter((item) => item.estado === "suspendido").length, icon: Users, tone: "red" },
        { label: "Premium", value: filtrado.usuarios.filter((item) => item.plan.toLowerCase().includes("premium")).length, icon: Crown, tone: "amber" },
      ];
    }

    if (tipoReporte === "suscripciones-pagos") {
      return [
        { label: "Suscripciones", value: filtrado.suscripciones.length, icon: ListChecks, tone: "brand" },
        { label: "Pagos", value: filtrado.pagos.length, icon: DollarSign, tone: "green" },
        { label: "Ingresos", value: money(filtrado.pagos.reduce((sum, item) => sum + item.monto, 0)), icon: DollarSign, tone: "amber" },
        { label: "Pendientes", value: filtrado.pagos.filter((item) => item.estado_pago === "pendiente").length, icon: FileText, tone: "red" },
      ];
    }

    if (tipoReporte === "academico") {
      return [
        { label: "Tareas", value: filtrado.tareas.length, icon: ListChecks, tone: "brand" },
        { label: "Proyectos", value: filtrado.proyectos.length, icon: FolderKanban, tone: "green" },
        { label: "Cursos", value: filtrado.cursos.length, icon: FileText, tone: "amber" },
        { label: "Actividad", value: filtrado.tareas.length + filtrado.proyectos.length, icon: FileText, tone: "slate" },
      ];
    }

    if (tipoReporte === "soporte") {
      return [
        { label: "Consultas", value: filtrado.soporte.length, icon: LifeBuoy, tone: "brand" },
        { label: "Pendientes", value: filtrado.soporte.filter((item) => item.estado_consulta === "pendiente").length, icon: LifeBuoy, tone: "amber" },
        { label: "Respondidas", value: filtrado.soporte.filter((item) => item.estado_consulta === "respondida").length, icon: LifeBuoy, tone: "green" },
        { label: "Cerradas", value: filtrado.soporte.filter((item) => item.estado_consulta === "cerrada").length, icon: LifeBuoy, tone: "slate" },
      ];
    }

    return [
      { label: "Usuarios", value: data.resumen.totalUsuarios, icon: Users, tone: "brand" },
      { label: "Premium", value: data.resumen.usuariosPremium, icon: Crown, tone: "amber" },
      { label: "Ingresos", value: money(data.resumen.ingresosEstimados), icon: DollarSign, tone: "green" },
      { label: "Soporte", value: data.resumen.consultasPendientes, icon: LifeBuoy, tone: "red" },
    ];
  }, [data.resumen, filtrado, tipoReporte]);

  const generarReporte = () => {
    setGenerado(true);
    setFechaGeneracion(new Date().toISOString());
  };

  const descargarCsv = () => {
    const csv = createCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${tipoReporte}-taskuni.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const imprimir = () => {
    window.print();
  };

  const limpiar = () => {
    setTipoReporte("ejecutivo");
    setFormato("pantalla");
    setFechaInicio("");
    setFechaFin("");
    setGenerado(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="card flex items-center gap-4">
            <div
              className={
                metric.tone === "brand"
                  ? "flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100"
                  : metric.tone === "green"
                    ? "flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-100"
                    : metric.tone === "amber"
                      ? "flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-100"
                      : metric.tone === "red"
                        ? "flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-100"
                        : "flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-100"
              }
            >
              <metric.icon size={22} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{metric.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] print:block">
        <div className="space-y-6">
          <div className="card space-y-4 print:shadow-none">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Generación de reportes</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Selecciona el tipo de reporte, el rango de fechas y el formato de salida.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="label">Tipo de reporte</label>
                <select className="input" value={tipoReporte} onChange={(e) => setTipoReporte(e.target.value as ReportType)}>
                  {Object.entries(labels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Fecha inicial</label>
                <input className="input" type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
              </div>
              <div>
                <label className="label">Fecha final</label>
                <input className="input" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Formato</label>
                <select className="input" value={formato} onChange={(e) => setFormato(e.target.value as FormatType)}>
                  <option value="pantalla">Vista previa</option>
                  <option value="csv">CSV</option>
                  <option value="pdf">PDF / impresión</option>
                </select>
              </div>
              <div className="flex items-end gap-3">
                <button type="button" onClick={generarReporte} className="btn-primary flex-1">Generar reporte</button>
                <button type="button" onClick={limpiar} className="btn-secondary">
                  <RotateCcw size={16} className="mr-2" />
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>

          <div className="card space-y-4 print:shadow-none">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Vista previa</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{labels[tipoReporte]}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={descargarCsv} className="btn-secondary">
                  <Download size={16} className="mr-2" />
                  Exportar CSV
                </button>
                <button type="button" onClick={imprimir} className="btn-secondary">
                  <Printer size={16} className="mr-2" />
                  Imprimir / PDF
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{labels[tipoReporte]}</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">Generado por {data.generadoPor}</p>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  <p>Fecha: {formatDateTime(fechaGeneracion)}</p>
                  <p>Formato: {formato.toUpperCase()}</p>
                </div>
              </div>

              {generado ? (
                <>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-2xl bg-white p-3 dark:bg-slate-900">
                      <p className="text-xs text-slate-400">Registros</p>
                      <p className="text-2xl font-semibold text-slate-900 dark:text-white">{rows.length}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3 dark:bg-slate-900">
                      <p className="text-xs text-slate-400">Rango</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{fechaInicio || "Inicio"} - {fechaFin || "Hoy"}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3 dark:bg-slate-900">
                      <p className="text-xs text-slate-400">Categoría</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{labels[tipoReporte]}</p>
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white dark:bg-slate-900">
                        <tr className="border-b border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-400">
                          {rows[0] && Object.keys(rows[0]).map((header) => (
                            <th key={header} className="px-4 py-3 font-medium">{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-950">
                        {rows.slice(0, 12).map((row, index) => (
                          <tr key={index} className="border-b border-slate-100 last:border-0 dark:border-white/5">
                            {Object.values(row).map((value, rowIndex) => (
                              <td key={`${index}-${rowIndex}`} className="px-4 py-3 text-slate-700 dark:text-slate-200">{String(value)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 dark:border-white/10 dark:bg-slate-950 dark:text-slate-400">
                  Selecciona parámetros y presiona “Generar reporte” para ver la vista previa.
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card print:shadow-none">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Resumen ejecutivo</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p>Usuarios registrados: {data.resumen.totalUsuarios}</p>
              <p>Usuarios Premium: {data.resumen.usuariosPremium}</p>
              <p>Ingresos estimados: {money(data.resumen.ingresosEstimados)}</p>
              <p>Tareas creadas: {data.resumen.totalTareas}</p>
              <p>Proyectos activos: {data.resumen.totalProyectos}</p>
              <p>Consultas pendientes: {data.resumen.consultasPendientes}</p>
            </div>
          </div>

          <div className="card print:shadow-none">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Guía rápida</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <p>• Usuarios: crecimiento y segmentación por rol o plan.</p>
              <p>• Suscripciones y pagos: seguimiento comercial del SaaS.</p>
              <p>• Académico: tareas, proyectos y cursos activos.</p>
              <p>• Soporte: volumen y estado de atención al usuario.</p>
              <p>• Ejecutivo: lectura rápida para dirección.</p>
            </div>
          </div>
        </aside>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none,
          .print\\:shadow-none * {
            visibility: visible;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
