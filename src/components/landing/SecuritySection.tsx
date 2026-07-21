import { LockKeyhole, UserCheck, FileCheck, Shield, KeyRound } from "lucide-react";

const items = [
  {
    icon: LockKeyhole,
    titulo: "Contraseñas almacenadas de forma segura",
    descripcion: "Las contraseñas se cifran antes de guardarse en la base de datos.",
  },
  {
    icon: UserCheck,
    titulo: "Acceso protegido según el rol del usuario",
    descripcion: "Cada usuario tiene permisos específicos según su perfil.",
  },
  {
    icon: FileCheck,
    titulo: "Validación de información",
    descripcion: "Los datos ingresados se validan antes de ser procesados.",
  },
  {
    icon: Shield,
    titulo: "Protección de rutas privadas",
    descripcion: "Las páginas internas requieren autenticación para acceder.",
  },
  {
    icon: KeyRound,
    titulo: "Administración segura de sesiones",
    descripcion: "Las sesiones expiran y se gestionan de forma controlada.",
  },
];

export default function SecuritySection() {
  return (
    <section className="bg-white py-16 dark:bg-slate-950/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">
          Seguridad y confianza
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-600 dark:text-slate-400">
          Tus datos académicos merecen estar protegidos. Estas son las medidas
          implementadas en la plataforma.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.titulo} className="card flex items-start gap-4">
              <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <item.icon size={20} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.titulo}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {item.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
