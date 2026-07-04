import { prisma } from "@/lib/prisma";
import ThemeToggle from "@/components/ThemeToggle";

export default async function AdminConfiguracionPage() {
  const admin = await prisma.usuario.findFirst({ where: { rol: "administrador" }, orderBy: { fecha_registro: "asc" } });

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configuración del sistema</h1><p className="text-slate-500 dark:text-slate-400">Parámetros generales y perfil del administrador.</p></div>
      <div className="card grid gap-4 md:grid-cols-2">
        <div><p className="text-xs text-slate-400">Administrador</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{admin?.nombres} {admin?.apellidos}</p></div>
        <div><p className="text-xs text-slate-400">Correo</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{admin?.correo}</p></div>
        <div><p className="text-xs text-slate-400">Módulos activos</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">Dashboard, usuarios, soporte, pagos</p></div>
        <div><p className="text-xs text-slate-400">Seguridad</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">2FA preparada · JWT</p></div>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle compact />
        <span className="text-sm text-slate-500 dark:text-slate-400">Cambiar tema</span>
      </div>
    </div>
  );
}
