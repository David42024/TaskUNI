"use client";

import { useState } from "react";

export interface DatosProyecto {
  nombre_proyecto: string;
  descripcion?: string;
  fecha_entrega?: string | null;
  estado_proyecto: "planificacion" | "en_progreso" | "completado" | "atrasado";
  avance_general: number;
}

interface Props {
  valoresIniciales?: Partial<DatosProyecto>;
  onGuardar: (datos: DatosProyecto) => Promise<void>;
  onCancelar: () => void;
}

export default function FormularioProyecto({ valoresIniciales, onGuardar, onCancelar }: Props) {
  const [datos, setDatos] = useState<DatosProyecto>({
    nombre_proyecto: valoresIniciales?.nombre_proyecto ?? "",
    descripcion: valoresIniciales?.descripcion ?? "",
    fecha_entrega: valoresIniciales?.fecha_entrega
      ? valoresIniciales.fecha_entrega.substring(0, 10)
      : "",
    estado_proyecto: valoresIniciales?.estado_proyecto ?? "planificacion",
    avance_general: valoresIniciales?.avance_general ?? 0,
  });
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (datos.nombre_proyecto.trim().length < 2) {
      setError("El nombre del proyecto es obligatorio");
      return;
    }
    setGuardando(true);
    try {
      await onGuardar(datos);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div>
        <label className="label">Nombre del proyecto</label>
        <input
          className="input"
          value={datos.nombre_proyecto}
          onChange={(e) => setDatos({ ...datos, nombre_proyecto: e.target.value })}
          placeholder="Ej. Sistema de Gestión de Calidad - UNT"
        />
      </div>

      <div>
        <label className="label">Descripción</label>
        <textarea
          className="input"
          rows={3}
          value={datos.descripcion ?? ""}
          onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Fecha de entrega</label>
          <input
            type="date"
            className="input"
            value={datos.fecha_entrega ?? ""}
            onChange={(e) => setDatos({ ...datos, fecha_entrega: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Estado</label>
          <select
            className="input"
            value={datos.estado_proyecto}
            onChange={(e) =>
              setDatos({ ...datos, estado_proyecto: e.target.value as DatosProyecto["estado_proyecto"] })
            }
          >
            <option value="planificacion">Planificación</option>
            <option value="en_progreso">En progreso</option>
            <option value="completado">Completado</option>
            <option value="atrasado">Atrasado</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Avance general: {datos.avance_general}%</label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          className="w-full accent-brand-600"
          value={datos.avance_general}
          onChange={(e) => setDatos({ ...datos, avance_general: Number(e.target.value) })}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancelar} className="btn-secondary" disabled={guardando}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar proyecto"}
        </button>
      </div>
    </form>
  );
}
