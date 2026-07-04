import { prisma } from "@/lib/prisma";
import { requireUsuario } from "@/lib/session";
import CardResumen from "@/components/CardResumen";
import { ShieldCheck, User, Mail, School, GraduationCap, Layers3 } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default async function ConfiguracionEstudiantePage() {
  const user = await requireUsuario();
  const usuario = await prisma.usuario.findUnique({
    where: { id_usuario: user.id },
    include: { perfil_estudiante: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configuración</h1>
        <p className="text-slate-500 dark:text-slate-400">Datos personales y académicos del estudiante.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardResumen titulo="Estado de cuenta" valor={usuario?.estado ?? "activo"} icon={ShieldCheck} color="green" />
        <CardResumen titulo="Rol" valor="Estudiante" icon={User} color="brand" />
        <CardResumen titulo="Correo" valor={usuario?.correo ?? "—"} icon={Mail} color="slate" />
        <CardResumen titulo="Universidad" valor={usuario?.perfil_estudiante?.universidad ?? "—"} icon={School} color="amber" />
      </div>

      <div className="card grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Nombre completo</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{usuario?.nombres} {usuario?.apellidos}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Carrera</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{usuario?.perfil_estudiante?.carrera ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Ciclo académico</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{usuario?.perfil_estudiante?.ciclo_academico ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Código de estudiante</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{usuario?.perfil_estudiante?.codigo_estudiante ?? "—"}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <ThemeToggle compact />
        <button className="btn-primary">Actualizar perfil</button>
        <button className="btn-secondary">Cambiar contraseña</button>
      </div>
    </div>
  );
}
