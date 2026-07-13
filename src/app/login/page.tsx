"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);

    const resultado = await signIn("credentials", {
      correo,
      contrasena,
      redirect: false,
    });

    setCargando(false);

    if (resultado?.error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }

    // Redirige según rol consultando la sesión recién creada
    const res = await fetch("/api/auth/session");
    const session = await res.json();
    router.push(session?.user?.rol === "administrador" ? "/admin" : "/dashboard");
    router.refresh();
  }

  return (
    <div>
      <Navbar />
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
        <div className="card">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Accede a tu panel de TaskUni.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}
            <div>
              <label className="label">Correo electrónico</label>
              <input
                type="email"
                required
                className="input"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="tucorreo@unt.edu.pe"
              />
            </div>
            <div>
              <label className="label">Contraseña</label>
              <input
                type="password"
                required
                className="input"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••"
              />
              <div className="mt-1 text-right">
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  ¿Olvidaste tu contraseña? Contacta a soporte.
                </span>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={cargando}>
              {cargando ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="font-medium text-brand-600 hover:underline">
              Regístrate gratis
            </Link>
          </p>

          <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500 dark:bg-white/5 dark:text-slate-400">
            <p className="font-medium text-slate-600 dark:text-slate-300">Cuentas de prueba (seed):</p>
            <p>Administrador: admin@taskuni.edu.pe</p>
            <p>Estudiante: manuel.torres@unt.edu.pe</p>
            <p>Contraseña: Password123!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
