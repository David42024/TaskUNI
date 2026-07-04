"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import CardResumen from "@/components/CardResumen";
import { LifeBuoy, MessageSquare, CircleAlert, CheckCircle2 } from "lucide-react";

interface Consulta {
  id_consulta: string;
  asunto: string;
  mensaje: string;
  respuesta: string | null;
  estado_consulta: "pendiente" | "respondida" | "cerrada";
  fecha_envio: string;
}

const colorEstado: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-700",
  respondida: "bg-emerald-100 text-emerald-700",
  cerrada: "bg-slate-100 text-slate-600",
};

export default function SoportePage() {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function cargar() {
    setCargando(true);
    const res = await fetch("/api/soporte");
    setConsultas(await res.json());
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function handleEnviar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (asunto.trim().length < 2 || mensaje.trim().length < 5) {
      setError("Completa el asunto y el mensaje.");
      return;
    }
    setEnviando(true);
    const res = await fetch("/api/soporte", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asunto, mensaje }),
    });
    setEnviando(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "No se pudo enviar la consulta");
      return;
    }
    setAsunto("");
    setMensaje("");
    await cargar();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Soporte</h1>
        <p className="text-slate-500 dark:text-slate-400">¿Tienes algún problema o duda? Escríbenos y revisa el estado de tus tickets.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardResumen titulo="Consultas" valor={consultas.length} icon={MessageSquare} color="brand" />
        <CardResumen titulo="Pendientes" valor={consultas.filter((c) => c.estado_consulta === "pendiente").length} icon={CircleAlert} color="amber" />
        <CardResumen titulo="Respondidas" valor={consultas.filter((c) => c.estado_consulta === "respondida").length} icon={CheckCircle2} color="green" />
        <CardResumen titulo="Canal activo" valor="24/7" icon={LifeBuoy} color="slate" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-3 font-semibold text-slate-800 dark:text-white">Nueva consulta</h3>
          <form onSubmit={handleEnviar} className="space-y-4">
            {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-200">{error}</div>}
            <div>
              <label className="label">Asunto</label>
              <input className="input" value={asunto} onChange={(e) => setAsunto(e.target.value)} />
            </div>
            <div>
              <label className="label">Mensaje</label>
              <textarea
                rows={5}
                className="input"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Cuéntanos qué sucede..."
              />
            </div>
            <button className="btn-primary" disabled={enviando}>
              {enviando ? "Enviando..." : "Enviar consulta"}
            </button>
          </form>
        </div>

        <div className="card">
          <h3 className="mb-3 font-semibold text-slate-800 dark:text-white">Historial de consultas</h3>
          {cargando ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">Cargando...</p>
          ) : consultas.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500">Aún no has enviado consultas.</p>
          ) : (
            <ul className="space-y-4">
              {consultas.map((c) => (
                <li key={c.id_consulta} className="border-b border-slate-100 pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-800 dark:text-white">{c.asunto}</p>
                    <span className={clsx("badge", colorEstado[c.estado_consulta])}>
                      {c.estado_consulta}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{c.mensaje}</p>
                  {c.respuesta && (
                    <p className="mt-2 rounded-lg bg-brand-50 p-2 text-sm text-brand-800 dark:bg-brand-500/10 dark:text-brand-100">
                      <strong>Respuesta:</strong> {c.respuesta}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {new Date(c.fecha_envio).toLocaleDateString("es-PE")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
