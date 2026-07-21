import { Lightbulb, TrendingUp, TrendingDown, Info } from "lucide-react";

interface Tarea {
  id_tarea: string;
  titulo: string;
  estado_tarea: string;
  fecha_limite: Date | null;
  fecha_actualizacion: Date;
  curso: { nombre_curso: string } | null;
}

interface Curso {
  id_curso: string;
  nombre_curso: string;
  tareas: Tarea[];
}

interface Props {
  tareas: Tarea[];
  cursos: Curso[];
  cumplimiento: number;
  racha: number;
  variacion: number | null;
  completadasSemanaPasada: number;
}

export default function PerformanceObservations({
  tareas,
  cursos,
  cumplimiento,
  racha,
  variacion,
  completadasSemanaPasada,
}: Props) {
  const observaciones: { icon: React.ComponentType<{ size?: number; className?: string }>; texto: string; color: string }[] = [];

  if (variacion !== null) {
    if (variacion > 0) {
      observaciones.push({
        icon: TrendingUp,
        texto: `Tu cumplimiento mejoró un ${variacion}% respecto al periodo anterior.`,
        color: "text-emerald-600 dark:text-emerald-400",
      });
    } else if (variacion < 0) {
      observaciones.push({
        icon: TrendingDown,
        texto: `Tu cumplimiento bajó un ${Math.abs(variacion)}% respecto al periodo anterior.`,
        color: "text-red-600 dark:text-red-400",
      });
    }
  }

  const cursoPeor = cursos
    .map((c) => ({
      nombre: c.nombre_curso,
      completadas: c.tareas.filter((t) => t.estado_tarea === "completada").length,
      vencidas: c.tareas.filter((t) => t.estado_tarea === "vencida").length,
      total: c.tareas.length,
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.vencidas - a.vencidas)[0];

  if (cursoPeor && cursoPeor.vencidas > 0) {
    observaciones.push({
      icon: Lightbulb,
      texto: `El curso con más actividades vencidas es "${cursoPeor.nombre}" (${cursoPeor.vencidas} vencidas de ${cursoPeor.total} actividades).`,
      color: "text-amber-600 dark:text-amber-400",
    });
  }

  const tareasProximas = tareas.filter((t) => {
    if (t.estado_tarea === "completada" || t.estado_tarea === "vencida") return false;
    if (!t.fecha_limite) return false;
    const diff = (t.fecha_limite.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  if (tareasProximas.length > 0) {
    observaciones.push({
      icon: Info,
      texto: `Tienes ${tareasProximas.length} entrega${tareasProximas.length !== 1 ? "s" : ""} próxima${tareasProximas.length !== 1 ? "s" : ""} durante esta semana.`,
      color: "text-brand-600 dark:text-brand-400",
    });
  }

  if (racha >= 5) {
    observaciones.push({
      icon: TrendingUp,
      texto: `Mantienes una racha de ${racha} días con actividad académica registrada. ¡Sigue así!`,
      color: "text-emerald-600 dark:text-emerald-400",
    });
  }

  if (completadasSemanaPasada === 0 && tareas.filter((t) => t.estado_tarea !== "completada").length > 0) {
    observaciones.push({
      icon: Lightbulb,
      texto: "No completaste ninguna tarea la semana pasada. Revisa tus pendientes pendientes.",
      color: "text-amber-600 dark:text-amber-400",
    });
  }

  if (observaciones.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">
        Observaciones de tu rendimiento
      </h3>
      <ul className="space-y-3">
        {observaciones.map((obs, i) => (
          <li key={i} className="flex items-start gap-3">
            <obs.icon size={18} className={`mt-0.5 shrink-0 ${obs.color}`} />
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {obs.texto}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
