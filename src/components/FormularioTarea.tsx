"use client";

import { useState } from "react";

export interface DatosTarea {
  id_tarea?: string;
  titulo: string;
  descripcion?: string | null;
  id_curso?: string | null;
  fecha_limite?: string | null;
  prioridad: "baja" | "media" | "alta";
  estado_tarea: "pendiente" | "en_progreso" | "completada" | "vencida";
  avance_porcentual: number;
}

interface Curso {
  id_curso: string;
  nombre_curso: string;
}

interface Props {
  cursos: Curso[];
  valoresIniciales?: Partial<DatosTarea>;
  onGuardar: (datos: DatosTarea) => Promise<void>;
  onCancelar: () => void;
}

export default function FormularioTarea({ cursos, valoresIniciales, onGuardar, onCancelar }: Props) {
  const [datos, setDatos] = useState<DatosTarea>({
    titulo: valoresIniciales?.titulo ?? "",
    descripcion: valoresIniciales?.descripcion ?? "",
    id_curso: valoresIniciales?.id_curso ?? "",
    fecha_limite: valoresIniciales?.fecha_limite
      ? valoresIniciales.fecha_limite.substring(0, 10)
      : "",
    prioridad: valoresIniciales?.prioridad ?? "media",
    estado_tarea: valoresIniciales?.estado_tarea ?? "pendiente",
    avance_porcentual: valoresIniciales?.avance_porcentual ?? 0,
  });
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (datos.titulo.trim().length < 2) {
      setError("El título es obligatorio");
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
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div>
        <label className="label">Título</label>
        <input
          className="input"
          value={datos.titulo}
          onChange={(e) => setDatos({ ...datos, titulo: e.target.value })}
          placeholder="Ej. Práctica calificada de Redes"
        />
      </div>

      <div>
        <label className="label">Descripción</label>
        <textarea
          className="input"
          rows={3}
          value={datos.descripcion ?? ""}
          onChange={(e) => setDatos({ ...datos, descripcion: e.target.value })}
          placeholder="Detalles de la tarea (opcional)"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Curso</label>
          <select
            className="input"
            value={datos.id_curso ?? ""}
            onChange={(e) => setDatos({ ...datos, id_curso: e.target.value })}
          >
            <option value="">Sin curso asociado</option>
            {cursos.map((c) => (
              <option key={c.id_curso} value={c.id_curso}>
                {c.nombre_curso}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Fecha límite</label>
          <input
            type="date"
            className="input"
            value={datos.fecha_limite ?? ""}
            onChange={(e) => setDatos({ ...datos, fecha_limite: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Prioridad</label>
          <select
            className="input"
            value={datos.prioridad}
            onChange={(e) => setDatos({ ...datos, prioridad: e.target.value as DatosTarea["prioridad"] })}
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </div>
        <div>
          <label className="label">Estado</label>
          <select
            className="input"
            value={datos.estado_tarea}
            onChange={(e) =>
              setDatos({ ...datos, estado_tarea: e.target.value as DatosTarea["estado_tarea"] })
            }
          >
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="completada">Completada</option>
            <option value="vencida">Vencida</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Avance: {datos.avance_porcentual}%</label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          className="w-full accent-brand-600"
          value={datos.avance_porcentual}
          onChange={(e) => setDatos({ ...datos, avance_porcentual: Number(e.target.value) })}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancelar} className="btn-secondary" disabled={guardando}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar tarea"}
        </button>
      </div>
    </form>
  );
}
