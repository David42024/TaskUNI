"use client";

import { useEffect, useState } from "react";
import { Check, Crown, Sparkles } from "lucide-react";
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
    window.dispatchEvent(new Event("taskuni-plan-changed"));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Planes y suscripción</h1>
        <p className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          Plan actual:
          <span className="flex items-center gap-1 font-medium text-brand-700 dark:text-brand-400">
            {suscripcion?.plan.tipo_plan === "premium" && <Crown size={15} className="text-amber-500 dark:text-amber-400" />}
            {suscripcion?.plan.nombre_plan ?? "Cargando..."}
          </span>
        </p>
      </div>

      {cargando ? (
        <div className="card flex items-center justify-center gap-2 py-10 text-center text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          Cargando planes...
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {planes.map((p) => {
            const esActual = suscripcion?.id_plan === p.id_plan;
            const esPremium = p.tipo_plan === "premium";
            return (
              <div
                key={p.id_plan}
                className={clsx(
                  "relative flex flex-col rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-white/5",
                  esPremium
                    ? "border-brand-200 dark:border-brand-800"
                    : "border-slate-200 dark:border-white/10"
                )}
              >
                {esPremium && (
                  <span className="absolute -top-2.5 left-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-600 to-brand-700 px-3 py-0.5 text-xs font-medium text-white shadow-sm dark:from-brand-500 dark:to-brand-600">
                    <Sparkles size={12} />
                    Recomendado
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <div
                    className={clsx(
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      esPremium
                        ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
                        : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                    )}
                  >
                    {esPremium ? <Crown size={18} /> : <Check size={18} />}
                  </div>
                  <h3
                    className={clsx(
                      "text-xl font-bold",
                      esPremium ? "text-brand-800 dark:text-brand-300" : "text-slate-900 dark:text-white"
                    )}
                  >
                    {p.nombre_plan}
                  </h3>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {p.descripcion}
                </p>

                <p
                  className={clsx(
                    "mt-4 text-3xl font-bold",
                    esPremium ? "text-brand-800 dark:text-brand-300" : "text-slate-900 dark:text-white"
                  )}
                >
                  S/ {Number(p.precio_mensual).toFixed(2)}
                  <span className="text-base font-normal text-slate-400 dark:text-slate-500">/mes</span>
                </p>

                <ul className="mt-5 space-y-2.5">
                  {(beneficiosPorTipo[p.tipo_plan] ?? []).map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300"
                    >
                      <Check
                        size={16}
                        className={clsx(
                          "mt-0.5 shrink-0",
                          esPremium ? "text-brand-600 dark:text-brand-400" : "text-slate-400 dark:text-slate-500"
                        )}
                      />
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  {esActual ? (
                    <div
                      className={clsx(
                        "flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium",
                        esPremium
                          ? "border-brand-200 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-500/10 dark:text-brand-300"
                          : "border-slate-200 bg-slate-50 text-slate-600 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300"
                      )}
                    >
                      <Check size={16} />
                      Plan actual
                    </div>
                  ) : (
                    <button
                      disabled={cambiando}
                      onClick={() => handleCambiarPlan(p.id_plan)}
                      className={clsx(
                        "w-full rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
                        esPremium
                          ? "bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600"
                          : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5"
                      )}
                    >
                      {cambiando ? "Actualizando..." : "Cambiar a este plan"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-300">
        <Sparkles size={14} className="mt-0.5 shrink-0" />
        <p>
          Nota: los pagos están simulados en este prototipo académico. El equipo puede
          integrar una pasarela real (Stripe, MercadoPago, etc.) en el endpoint
          <code className="mx-1 rounded bg-amber-100 px-1 font-mono font-medium dark:bg-amber-800/40 dark:text-amber-200">/api/suscripcion</code>.
        </p>
      </div>
    </div>
  );
}
