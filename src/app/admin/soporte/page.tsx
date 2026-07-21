"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

interface Consulta {
  id_consulta: string;
  asunto: string;
  mensaje: string;
  respuesta: string | null;
  estado_consulta: "pendiente" | "respondida" | "cerrada";
  fecha_envio: string;
  usuario: { nombres: string; apellidos: string; correo: string };
}

const colorEstado: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  respondida: "bg-emerald-100 text-emerald-700",
  cerrada: "bg-slate-100 text-slate-600",
};

export default function AdminSoportePage() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});

  async function cargar() {
    setCargando(true);
    try {
      const res = await fetch("/api/soporte");
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setConsultas(data);
      } else {
        setConsultas([]);
      }
    } catch {
      setConsultas([]);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function handleResponder(id_consulta: string) {
    const respuesta = respuestas[id_consulta];
    if (!respuesta || respuesta.trim().length < 2) return;
    await fetch(`/api/soporte/${id_consulta}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ respuesta, estado_consulta: "respondida" }),
    });
    await cargar();
  }

  async function handleCerrar(id_consulta: string) {
    await fetch(`/api/soporte/${id_consulta}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado_consulta: "cerrada" }),
    });
    await cargar();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Consultas de soporte</h1>
        <p className="text-slate-500">Atiende las consultas enviadas por los estudiantes.</p>
      </div>

      {cargando ? (
        <div className="card text-center text-slate-400">Cargando consultas...</div>
      ) : !Array.isArray(consultas) || consultas.length === 0 ? (
        <div className="card text-center text-slate-400">No hay consultas registradas.</div>
      ) : (
        <div className="space-y-4">
          {consultas.map((c) => (
            <div key={c.id_consulta} className="card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-800">{c.asunto}</p>
                  <p className="text-xs text-slate-400">
                    {c.usuario.nombres} {c.usuario.apellidos} — {c.usuario.correo}
                  </p>
                </div>
                <span className={clsx("badge", colorEstado[c.estado_consulta])}>{c.estado_consulta}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{c.mensaje}</p>

              {c.respuesta && (
                <p className="mt-2 rounded-lg bg-brand-50 p-2 text-sm text-brand-800">
                  <strong>Respuesta:</strong> {c.respuesta}
                </p>
              )}

              {c.estado_consulta !== "cerrada" && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    className="input flex-1"
                    placeholder="Escribe una respuesta..."
                    value={respuestas[c.id_consulta] ?? ""}
                    onChange={(e) => setRespuestas({ ...respuestas, [c.id_consulta]: e.target.value })}
                  />
                  <button className="btn-primary" onClick={() => handleResponder(c.id_consulta)}>
                    Responder
                  </button>
                  <button className="btn-secondary" onClick={() => handleCerrar(c.id_consulta)}>
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
