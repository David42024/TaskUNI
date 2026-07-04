"use client";

import { useRouter } from "next/navigation";
import FormularioProyecto, { DatosProyecto } from "@/components/FormularioProyecto";

export default function NuevoProyectoPage() {
  const router = useRouter();

  async function handleGuardar(datos: DatosProyecto) {
    const res = await fetch("/api/proyectos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "No se pudo crear el proyecto");
    router.push("/proyectos");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Nuevo proyecto</h1>
        <p className="text-slate-500 dark:text-slate-400">Crea un proyecto grupal y empieza con una estructura base.</p>
      </div>
      <div className="card max-w-2xl">
        <FormularioProyecto onGuardar={handleGuardar} onCancelar={() => router.push("/proyectos")} />
      </div>
    </div>
  );
}
