"use client";

import { useEffect, useState } from "react";
import FormularioTarea, { DatosTarea } from "@/components/FormularioTarea";
import { useRouter } from "next/navigation";

interface Curso { id_curso: string; nombre_curso: string; }

export default function NuevaTareaPage() {
  const router = useRouter();
  const [cursos, setCursos] = useState<Curso[]>([]);

  useEffect(() => {
    fetch("/api/cursos").then((res) => res.json()).then(setCursos);
  }, []);

  async function handleGuardar(datos: DatosTarea) {
    const res = await fetch("/api/tareas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "No se pudo crear la tarea");
    router.push("/tareas");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nueva tarea</h1>
        <p className="text-slate-500 dark:text-slate-400">Crea una tarea académica asociada a un curso.</p>
      </div>
      <div className="card max-w-2xl">
        <FormularioTarea cursos={cursos} onGuardar={handleGuardar} onCancelar={() => router.push("/tareas")} />
      </div>
    </div>
  );
}
