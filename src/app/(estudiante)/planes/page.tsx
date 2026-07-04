"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import clsx from "clsx";

interface Plan {
  id_plan: string;
  nombre_plan: string;
  descripcion: string;
  precio_mensual: string;
  tipo_plan: "gratuito" | "premium";
}

interface Suscripcion {
  id_plan: string;
  plan: Plan;
  estado_suscripcion: string;
  fecha_inicio: string;
}

const beneficiosPorTipo: Record<string, string[]> = {
  gratuito: [
    "Registro de cuenta",
    "Tareas y prioridades básicas",
    "Calendario académico",
    "Recordatorios básicos",
    "Proyectos grupales limitados",
  ],
  premium: [
    "Tareas ilimitadas",
    "Tableros Kanban avanzados",
    "Reportes de productividad",
    "Recordatorios inteligentes",
    "Mayor almacenamiento en la nube",
    "Analítica de rendimiento",
  ],
};

export default function PlanesPage() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [cambiando, setCambiando] = useState(false);

  async function cargar() {
    setCargando(true);
    const [resPlanes, resSus] = await Promise.all([fetch("/api/planes"), fetch("/api/suscripcion")]);
    setPlanes(await resPlanes.json());
    setSuscripcion(await resSus.json());
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function handleCambiarPlan(id_plan: string) {
    setCambiando(true);
    await fetch("/api/suscripcion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_plan }),
    });
    setCambiando(false);
    await cargar();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Planes y suscripción</h1>
        <p className="text-slate-500">
          Plan actual:{" "}
          <span className="font-medium text-brand-700">
            {suscripcion?.plan.nombre_plan ?? "Cargando..."}
          </span>
        </p>
      </div>

      {cargando ? (
        <div className="card text-center text-slate-400">Cargando planes...</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {planes.map((p) => {
            const esActual = suscripcion?.id_plan === p.id_plan;
            return (
              <div
                key={p.id_plan}
                className={clsx(
                  "card",
                  p.tipo_plan === "premium" && "border-brand-200 bg-brand-50/40"
                )}
              >
                <h3 className="text-xl font-bold text-slate-900">{p.nombre_plan}</h3>
                <p className="mt-1 text-sm text-slate-500">{p.descripcion}</p>
                <p className="mt-4 text-2xl font-bold text-slate-900">
                  S/ {Number(p.precio_mensual).toFixed(2)}
                  <span className="text-sm font-normal text-slate-400">/mes</span>
                </p>
                <ul className="mt-4 space-y-2">
                  {(beneficiosPorTipo[p.tipo_plan] ?? []).map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check size={16} className="text-brand-600" /> {b}
                    </li>
                  ))}
                </ul>
                <button
                  disabled={esActual || cambiando}
                  onClick={() => handleCambiarPlan(p.id_plan)}
                  className={clsx("mt-6 w-full", esActual ? "btn-secondary" : "btn-primary")}
                >
                  {esActual ? "Plan actual" : cambiando ? "Actualizando..." : "Cambiar a este plan"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-slate-400">
        Nota: los pagos están simulados en este prototipo académico. El equipo puede
        integrar una pasarela real (Stripe, MercadoPago, etc.) en el endpoint
        <code className="mx-1 rounded bg-slate-100 px-1">/api/suscripcion</code>.
      </p>
    </div>
  );
}
