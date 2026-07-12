"use client";

import { useEffect, useState } from "react";
import TablaUsuarios, { UsuarioVista } from "@/components/TablaUsuarios";

export default function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioVista[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/usuarios");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body?.error ?? `Error ${res.status}`);
        setUsuarios([]);
      } else {
        setUsuarios(await res.json());
      }
    } catch (e) {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function handleCambiarEstado(id_usuario: string, estado: string) {
    await fetch(`/api/admin/usuarios/${id_usuario}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    await cargar();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gestión de usuarios</h1>
        <p className="text-slate-500">Consulta y administra el estado de las cuentas de estudiantes.</p>
      </div>

      {cargando ? (
        <div className="card text-center text-slate-400">Cargando usuarios...</div>
      ) : error ? (
        <div className="card text-center text-red-500">{error}</div>
      ) : (
        <TablaUsuarios usuarios={usuarios} onCambiarEstado={handleCambiarEstado} />
      )}
    </div>
  );
}
