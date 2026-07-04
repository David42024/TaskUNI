"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import CalendarioAcademico, { EventoVista } from "@/components/CalendarioAcademico";

export default function CalendarioPage() {
  const [eventos, setEventos] = useState<EventoVista[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [error, setError] = useState("");
  const [datos, setDatos] = useState({
    titulo: "",
    descripcion: "",
    tipo_evento: "otro",
    fecha_inicio: "",
    ubicacion: "",
  });

  async function cargarEventos() {
    setCargando(true);
    const res = await fetch("/api/eventos");
    setEventos(await res.json());
    setCargando(false);
  }

  useEffect(() => {
    cargarEventos();
  }, []);

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!datos.titulo || !datos.fecha_inicio) {
      setError("Título y fecha son obligatorios");
      return;
    }
    const res = await fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "No se pudo crear el evento");
      return;
    }
    setModalAbierto(false);
    setDatos({ titulo: "", descripcion: "", tipo_evento: "otro", fecha_inicio: "", ubicacion: "" });
    await cargarEventos();
  }

  async function handleEliminar(id_evento: string) {
    await fetch(`/api/eventos/${id_evento}`, { method: "DELETE" });
    await cargarEventos();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendario académico</h1>
          <p className="text-slate-500">Entregas, reuniones y exámenes en un solo lugar.</p>
        </div>
        <button className="btn-primary" onClick={() => setModalAbierto(true)}>
          <Plus size={16} className="mr-1" /> Nuevo evento
        </button>
      </div>

      {cargando ? (
        <div className="card text-center text-slate-400">Cargando calendario...</div>
      ) : (
        <CalendarioAcademico eventos={eventos} onEliminar={handleEliminar} />
      )}

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Nuevo evento</h3>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCrear} className="space-y-4">
              {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
              <div>
                <label className="label">Título</label>
                <input
                  className="input"
                  value={datos.titulo}
                  onChange={(e) => setDatos({ ...datos, titulo: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Tipo</label>
                  <select
                    className="input"
                    value={datos.tipo_evento}
                    onChange={(e) => setDatos({ ...datos, tipo_evento: e.target.value })}
                  >
                    <option value="entrega">Entrega</option>
                    <option value="reunion">Reunión</option>
                    <option value="examen">Examen</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="label">Fecha</label>
                  <input
                    type="date"
                    className="input"
                    value={datos.fecha_inicio}
                    onChange={(e) => setDatos({ ...datos, fecha_inicio: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label">Ubicación (opcional)</label>
                <input
                  className="input"
                  value={datos.ubicacion}
                  onChange={(e) => setDatos({ ...datos, ubicacion: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setModalAbierto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
