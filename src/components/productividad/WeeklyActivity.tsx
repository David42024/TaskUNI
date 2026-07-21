"use client";

interface Tarea {
  id_tarea: string;
  estado_tarea: string;
  fecha_actualizacion: Date;
}

interface Props {
  tareas: Tarea[];
}

type DiaData = {
  dia: string;
  label: string;
  completadas: number;
  nivel: 0 | 1 | 2 | 3 | 4;
};

function generarSemana(tareas: Tarea[]): DiaData[] {
  const ahora = new Date();
  const dias: DiaData[] = [];
  const nombres = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

  for (let i = 6; i >= 0; i--) {
    const dia = new Date(ahora.getTime() - i * 24 * 60 * 60 * 1000);
    const diaSiguiente = new Date(dia.getTime() + 24 * 60 * 60 * 1000);
    const completadas = tareas.filter((t) => {
      const actualizada = new Date(t.fecha_actualizacion);
      return (
        t.estado_tarea === "completada" &&
        actualizada >= dia &&
        actualizada < diaSiguiente
      );
    }).length;

    let nivel: DiaData["nivel"] = 0;
    if (completadas > 0) nivel = 1;
    if (completadas >= 2) nivel = 2;
    if (completadas >= 4) nivel = 3;
    if (completadas >= 6) nivel = 4;

    dias.push({
      dia: nombres[dia.getDay()],
      label: dia.toLocaleDateString("es-PE", {
        weekday: "short",
        day: "numeric",
      }),
      completadas,
      nivel,
    });
  }

  return dias;
}

const nivelesColor = [
  "bg-slate-100 dark:bg-white/5",
  "bg-brand-200 dark:bg-brand-900/50",
  "bg-brand-300 dark:bg-brand-700",
  "bg-brand-500 dark:bg-brand-500",
  "bg-brand-700 dark:bg-brand-300",
];

export default function WeeklyActivity({ tareas }: Props) {
  const semana = generarSemana(tareas);
  const totalSemana = semana.reduce((s, d) => s + d.completadas, 0);

  return (
    <div className="card">
      <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">
        Actividad semanal
      </h3>
      <p className="mb-4 text-xs text-slate-400 dark:text-slate-500">
        {totalSemana > 0
          ? `${totalSemana} tarea${totalSemana !== 1 ? "s" : ""} completada${totalSemana !== 1 ? "s" : ""} esta semana`
          : "No registraste actividad esta semana"}
      </p>
      <div className="grid grid-cols-7 gap-2">
        {semana.map((d) => (
          <div key={d.dia} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-medium uppercase text-slate-400 dark:text-slate-500">
              {d.dia}
            </span>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                nivelesColor[d.nivel]
              } ${
                d.nivel > 1
                  ? "text-white"
                  : "text-slate-500 dark:text-slate-400"
              }`}
              title={`${d.label}: ${d.completadas} completadas`}
            >
              {d.completadas > 0 ? d.completadas : ""}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              {d.label.split(" ")[1]}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
        <span>Baja</span>
        <div className="flex gap-0.5">
          {nivelesColor.map((c, i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-sm ${c}`}
            />
          ))}
        </div>
        <span>Alta</span>
      </div>
    </div>
  );
}
