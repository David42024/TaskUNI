"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

export interface EventoVista {
  id_evento: string;
  titulo: string;
  descripcion?: string | null;
  tipo_evento: "entrega" | "reunion" | "examen" | "otro";
  fecha_inicio: string;
  ubicacion?: string | null;
  isReadOnly?: boolean;
}

interface Props {
  eventos: EventoVista[];
  onEliminar: (id_evento: string) => void;
}

const colorTipo: Record<string, string> = {
  entrega: "bg-red-500",
  reunion: "bg-blue-500",
  examen: "bg-amber-500",
  otro: "bg-slate-400",
};

const etiquetaTipo: Record<string, string> = {
  entrega: "Entrega",
  reunion: "Reunión",
  examen: "Examen",
  otro: "Otro",
};

export default function CalendarioAcademico({ eventos, onEliminar }: Props) {
  const [mesActual, setMesActual] = useState(() => {
    const hoy = new Date();
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  });

  const diasDelMes = useMemo(() => {
    const anio = mesActual.getFullYear();
    const mes = mesActual.getMonth();
    const primerDiaSemana = new Date(anio, mes, 1).getDay();
    const totalDias = new Date(anio, mes + 1, 0).getDate();

    const celdas: (number | null)[] = [];
    for (let i = 0; i < primerDiaSemana; i++) celdas.push(null);
    for (let d = 1; d <= totalDias; d++) celdas.push(d);
    return celdas;
  }, [mesActual]);

  const eventosPorDia = useMemo(() => {
    const mapa: Record<number, EventoVista[]> = {};
    eventos.forEach((ev) => {
      const fecha = new Date(ev.fecha_inicio);
      if (fecha.getFullYear() === mesActual.getFullYear() && fecha.getMonth() === mesActual.getMonth()) {
        const dia = fecha.getDate();
        if (!mapa[dia]) mapa[dia] = [];
        mapa[dia].push(ev);
      }
    });
    return mapa;
  }, [eventos, mesActual]);

  const nombreMes = mesActual.toLocaleDateString("es-PE", { month: "long", year: "numeric" });
  const hoy = new Date();

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize text-slate-800">{nombreMes}</h3>
        <div className="flex gap-2">
          <button
            className="btn-secondary px-2 py-1.5"
            onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1))}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="btn-secondary px-2 py-1.5"
            onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {diasDelMes.map((dia, idx) => {
          const esHoy =
            dia !== null &&
            hoy.getDate() === dia &&
            hoy.getMonth() === mesActual.getMonth() &&
            hoy.getFullYear() === mesActual.getFullYear();
          return (
            <div
              key={idx}
              className={clsx(
                "min-h-[90px] rounded-lg border border-slate-100 p-1.5 text-left align-top",
                dia === null && "border-transparent",
                esHoy && "border-brand-300 bg-brand-50/50"
              )}
            >
              {dia !== null && (
                <>
                  <span className={clsx("text-xs font-medium", esHoy ? "text-brand-700" : "text-slate-400")}>
                    {dia}
                  </span>
                  <div className="mt-1 space-y-1">
                    {(eventosPorDia[dia] ?? []).slice(0, 3).map((ev) => (
                      <div
                        key={ev.id_evento}
                        className="group flex items-center justify-between gap-1 rounded px-1 py-0.5 text-[10px] text-white"
                        style={{ backgroundColor: undefined }}
                      >
                        <span
                          className={clsx(
                            "flex-1 truncate rounded px-1 py-0.5",
                            colorTipo[ev.tipo_evento]
                          )}
                          title={`${etiquetaTipo[ev.tipo_evento]}: ${ev.titulo}`}
                        >
                          {ev.titulo}
                        </span>
                        {!ev.isReadOnly && (
                          <button
                            onClick={() => onEliminar(ev.id_evento)}
                            className="hidden text-slate-400 hover:text-red-500 group-hover:block"
                          >
                            <Trash2 size={10} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
        {Object.entries(etiquetaTipo).map(([clave, etiqueta]) => (
          <span key={clave} className="flex items-center gap-1.5">
            <span className={clsx("h-2.5 w-2.5 rounded-full", colorTipo[clave])} />
            {etiqueta}
          </span>
        ))}
      </div>
    </div>
  );
}
