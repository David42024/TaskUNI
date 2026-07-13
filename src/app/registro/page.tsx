"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function RegistroPage() {
  const router = useRouter();
  const [datos, setDatos] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    contrasena: "",
    universidad: "",
    carrera: "",
    ciclo_academico: "",
  });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const res = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No se pudo crear la cuenta.");
        setCargando(false);
        return;
      }

      const resultado = await signIn("credentials", {
        correo: datos.correo,
        contrasena: datos.contrasena,
        redirect: false,
      });

      if (resultado?.error) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("Ocurrió un error inesperado.");
      setCargando(false);
    }
  }

  return (
    <div>
      <Navbar />
      <div className="mx-auto flex max-w-lg flex-col justify-center px-4 py-12">
        <div className="card">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Crea tu cuenta gratuita</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Empieza a organizar tus tareas y proyectos en minutos.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nombres</label>
                <input
                  required
                  className="input"
                  value={datos.nombres}
                  onChange={(e) => setDatos({ ...datos, nombres: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Apellidos</label>
                <input
                  required
                  className="input"
                  value={datos.apellidos}
                  onChange={(e) => setDatos({ ...datos, apellidos: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label">Correo electrónico</label>
              <input
                type="email"
                required
                className="input"
                value={datos.correo}
                onChange={(e) => setDatos({ ...datos, correo: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                required
                minLength={8}
                className="input"
                value={datos.contrasena}
                onChange={(e) => setDatos({ ...datos, contrasena: e.target.value })}
                placeholder="Mínimo 8 caracteres"
              />
            </div>

            <div>
              <label className="label">Universidad</label>
              <input
                required
                className="input"
                value={datos.universidad}
                onChange={(e) => setDatos({ ...datos, universidad: e.target.value })}
                placeholder="Ej. Universidad Nacional de Trujillo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Carrera</label>
                <input
                  required
                  className="input"
                  value={datos.carrera}
                  onChange={(e) => setDatos({ ...datos, carrera: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Ciclo académico</label>
                <input
                  required
                  className="input"
                  value={datos.ciclo_academico}
                  onChange={(e) => setDatos({ ...datos, ciclo_academico: e.target.value })}
                  placeholder="Ej. 8vo ciclo"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={cargando}>
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-brand-600 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
