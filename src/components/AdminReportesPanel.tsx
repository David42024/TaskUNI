"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Printer, RotateCcw, Users, Crown, DollarSign, ListChecks, FolderKanban, LifeBuoy, FileText } from "lucide-react";
import CardResumen from "@/components/CardResumen";

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
  academico: "Reporte academico de uso",
  soporte: "Reporte de soporte",
  ejecutivo: "Reporte ejecutivo del e-Business",
};

function money(value: number) {
  return `S/ ${value.toFixed(2)}`;
}

/**
 * Builds an HTML string to be exported as an .xls file.
 * Excel parses HTML tables and respects basic CSS (background, color, borders, fonts).
 */
function createExcelHtml(rows: Record<string, string | number | undefined>[], title: string, dateStr: string) {
  if (rows.length === 0) return "";
  
  const headerSet = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      headerSet.add(key);
    }
  }
  const headers = Array.from(headerSet);

  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; }
        .title-row { font-size: 20px; font-weight: bold; color: #1e293b; text-align: left; }
        .date-row { font-size: 12px; color: #64748b; text-align: left; }
        .header-cell { background-color: #0f172a; color: #ffffff; font-weight: bold; padding: 12px; text-align: center; border: 1px solid #0f172a; }
        .data-cell { padding: 10px; border: 1px solid #e2e8f0; font-size: 12px; color: #334155; vertical-align: middle; }
        .alt-row { background-color: #f8fafc; }
      </style>
    </head>
    <body>
      <table>
        <tr><td colspan="${headers.length}" class="title-row">${title}</td></tr>
        <tr><td colspan="${headers.length}" class="date-row">Generado el: ${dateStr}</td></tr>
        <tr><td colspan="${headers.length}"></td></tr>
        <tr>
          ${headers.map(h => `<td class="header-cell">${h}</td>`).join('')}
        </tr>
        ${rows.map((row, i) => `
          <tr class="${i % 2 !== 0 ? 'alt-row' : ''}">
            ${headers.map(h => `<td class="data-cell">${row[h] !== undefined && row[h] !== null ? row[h] : '—'}</td>`).join('')}
          </tr>
        `).join('')}
      </table>
    </body>
    </html>
  `;
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
  const [fechaGeneracion, setFechaGeneracion] = useState(generadoEn);
  // Renderizado solo en cliente para evitar hydration mismatch con Intl.DateTimeFormat
  const [fechaDisplay, setFechaDisplay] = useState("");

  useEffect(() => {
    setFechaDisplay(formatDateTime(fechaGeneracion));
  }, [fechaGeneracion]);

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

  const rows = useMemo((): Record<string, string | number>[] => {
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
      case "suscripciones-pagos": {
        // Use a unified schema so every row has the same columns.
        // Fields that don't apply to a given row type get a dash placeholder.
        const suscripcionRows = filtrado.suscripciones.map((item) => ({
          Tipo: "Suscripcion",
          Usuario: item.usuario,
          Plan: item.plan,
          Estado: item.estado_suscripcion,
          Monto: "—",
          Metodo: "—",
          Fecha: item.fecha_inicio.slice(0, 10),
        }));
        const pagoRows = filtrado.pagos.map((item) => ({
          Tipo: "Pago",
          Usuario: item.usuario,
          Plan: item.plan,
          Estado: item.estado_pago,
          Monto: money(item.monto),
          Metodo: item.metodo_pago,
          Fecha: item.fecha_pago.slice(0, 10),
        }));
        return [...suscripcionRows, ...pagoRows];
      }
      case "academico": {
        // Use a unified schema for tareas + proyectos
        const tareaRows = filtrado.tareas.map((item) => ({
          Tipo: "Tarea",
          Titulo: item.titulo,
          Estado: item.estado_tarea,
          Prioridad: item.prioridad,
          Usuario: item.usuario,
          Curso: item.curso,
          Integrantes: "—",
          "Total Tareas": "—",
        }));
        const proyectoRows = filtrado.proyectos.map((item) => ({
          Tipo: "Proyecto",
          Titulo: item.nombre_proyecto,
          Estado: item.estado_proyecto,
          Prioridad: "—",
          Usuario: item.creador,
          Curso: item.curso,
          Integrantes: item.integrantes,
          "Total Tareas": item.tareas,
        }));
        return [...tareaRows, ...proyectoRows];
      }
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
          { Metrica: "Usuarios registrados", Valor: data.resumen.totalUsuarios },
          { Metrica: "Usuarios Premium", Valor: data.resumen.usuariosPremium },
          { Metrica: "Ingresos estimados", Valor: money(data.resumen.ingresosEstimados) },
          { Metrica: "Tareas creadas", Valor: data.resumen.totalTareas },
          { Metrica: "Proyectos activos", Valor: data.resumen.totalProyectos },
          { Metrica: "Consultas pendientes", Valor: data.resumen.consultasPendientes },
        ];
    }
  }, [data.resumen, filtrado, tipoReporte]);

  // Derive consistent headers from ALL rows (handles mixed-column datasets)
  const headers = useMemo(() => {
    if (rows.length === 0) return [];
    const headerSet = new Set<string>();
    for (const row of rows) {
      for (const key of Object.keys(row)) {
        headerSet.add(key);
      }
    }
    return Array.from(headerSet);
  }, [rows]);

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

  /** Trigger the Excel download */
  const descargarExcel = () => {
    const html = createExcelHtml(rows, labels[tipoReporte], fechaDisplay);
    const blob = new Blob(["\uFEFF" + html], { type: "application/vnd.ms-excel;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${tipoReporte}-taskuni.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /** Trigger browser print dialog (for PDF) */
  const imprimir = () => {
    window.print();
  };

  /** Main "Generar reporte" button: dispatches action based on selected format */
  const generarReporte = () => {
    setFechaGeneracion(new Date().toISOString());
    if (formato === "csv") {
      // Small delay to let state update before downloading
      setTimeout(() => descargarExcel(), 100);
    } else if (formato === "pdf") {
      setTimeout(() => imprimir(), 100);
    }
    // "pantalla" just refreshes the preview (already done by setFechaGeneracion)
  };

  const limpiar = () => {
    setTipoReporte("ejecutivo");
    setFormato("pantalla");
    setFechaInicio("");
    setFechaFin("");
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <CardResumen 
            key={metric.label}
            titulo={metric.label}
            valor={metric.value}
            icon={metric.icon}
            color={metric.tone as any}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] print:block">
        <div className="space-y-6">
          {/* Filters */}
          <div className="card space-y-4 print:hidden">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Generacion de reportes</h2>
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
                  <option value="csv">Excel (con diseño)</option>
                  <option value="pdf">PDF / Impresión</option>
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

          {/* Preview */}
          <div id="reporte-printable" className="card space-y-4 print:shadow-none">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Vista previa</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{labels[tipoReporte]}</p>
              </div>
              <div className="flex flex-wrap gap-2 print:hidden">
                <button type="button" onClick={descargarExcel} className="btn-secondary">
                  <Download size={16} className="mr-2" />
                  Exportar Excel
                </button>
                <button type="button" onClick={imprimir} className="btn-secondary">
                  <Printer size={16} className="mr-2" />
                  Imprimir / PDF
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
              {/* Report Header */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{labels[tipoReporte]}</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">Generado por {data.generadoPor}</p>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  <p suppressHydrationWarning>Fecha: {fechaDisplay}</p>
                  <p>Formato: {formato.toUpperCase()}</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl bg-white p-3 dark:bg-slate-900">
                  <p className="text-xs text-slate-400">Registros</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{rows.length}</p>
                </div>
                <div className="rounded-2xl bg-white p-3 dark:bg-slate-900">
                  <p className="text-xs text-slate-400">Rango</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{fechaInicio || "Inicio"} — {fechaFin || "Hoy"}</p>
                </div>
                <div className="rounded-2xl bg-white p-3 dark:bg-slate-900">
                  <p className="text-xs text-slate-400">Categoria</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{labels[tipoReporte]}</p>
                </div>
              </div>

              {/* Table */}
              {rows.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400 dark:border-white/10 dark:bg-slate-950">
                  No hay registros para el rango de fechas seleccionado.
                </div>
              ) : (
                <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/10">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-white dark:bg-slate-900">
                      <tr className="border-b border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-400">
                        {headers.map((header) => (
                          <th key={header} className="px-4 py-3 font-medium whitespace-nowrap">{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-950">
                      {rows.slice(0, 15).map((row, index) => (
                        <tr key={index} className="border-b border-slate-100 last:border-0 dark:border-white/5">
                          {headers.map((header, colIndex) => (
                            <td key={`${index}-${colIndex}`} className="px-4 py-3 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                              {String(row[header] ?? "—")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {rows.length > 15 && (
                    <p className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-400 dark:border-white/10 dark:bg-slate-900">
                      Mostrando 15 de {rows.length} registros — exporta en CSV para ver todos.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
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
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Guia rapida</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <p>• Usuarios: crecimiento y segmentacion por rol o plan.</p>
              <p>• Suscripciones y pagos: seguimiento comercial del SaaS.</p>
              <p>• Academico: tareas, proyectos y cursos activos.</p>
              <p>• Soporte: volumen y estado de atencion al usuario.</p>
              <p>• Ejecutivo: lectura rapida para direccion.</p>
            </div>
          </div>
        </aside>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 15mm;
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Hide everything outside the printable report */
          body * {
            visibility: hidden;
          }
          #reporte-printable,
          #reporte-printable * {
            visibility: visible;
          }
          #reporte-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
          
          /* Custom PDF Styling */
          #reporte-printable .rounded-3xl {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
            margin-top: 15px !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 8px !important;
            overflow: hidden !important;
          }
          th {
            background-color: #0f172a !important; /* Dark slate */
            color: #ffffff !important;
            padding: 10px 14px !important;
            font-size: 11px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            font-weight: 600 !important;
          }
          td {
            padding: 10px 14px !important;
            border-bottom: 1px solid #f1f5f9 !important;
            font-size: 12px !important;
            color: #334155 !important;
          }
          tr:nth-child(even) td {
            background-color: #f8fafc !important; /* Very light slate */
          }
          
          /* Metric boxes in print */
          .grid.gap-3 {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 15px !important;
            margin-bottom: 20px !important;
          }
          .grid.gap-3 > div {
            background-color: #f8fafc !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 12px !important;
            padding: 15px !important;
          }
          .grid.gap-3 > div p.text-xs {
            color: #64748b !important;
            font-size: 11px !important;
            text-transform: uppercase !important;
          }
          .grid.gap-3 > div p.text-2xl, .grid.gap-3 > div p.text-sm.font-semibold {
            color: #0f172a !important;
            font-size: 18px !important;
            font-weight: 700 !important;
          }
          
          /* Report header in print */
          .flex.justify-between.gap-3 {
            border-bottom: 2px solid #e2e8f0 !important;
            padding-bottom: 15px !important;
            margin-bottom: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
