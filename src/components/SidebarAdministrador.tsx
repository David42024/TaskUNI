"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import clsx from "clsx";
import {
  Banknote,
  BarChart3,
  BriefcaseBusiness,
  ChevronRight,
  Cloud,
  CreditCard,
  Crown,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Megaphone,
  Menu,
  Settings,
  ShieldCheck,
  Server,
  Users,
  ClipboardList,
  FolderKanban,
  Receipt,
  UserCog,
  BadgeDollarSign,
  MessageSquareMore,
} from "lucide-react";

export type SidebarAdministradorProps = {
  open: boolean;
  onClose: () => void;
  nombre: string;
  usuariosBadge: number;
  soporteBadge: number;
  premiumBadge: number;
  pagosBadge: string;
};

type Item = {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
};

const sections: { title: string; items: Item[] }[] = [
  {
    title: "GENERAL",
    items: [
      { href: "/admin", label: "Dashboard", description: "Métricas generales del negocio.", icon: LayoutDashboard },
      { href: "/admin/reportes", label: "Reportes", description: "Estadísticas del sistema y uso.", icon: BarChart3 },
    ],
  },
  {
    title: "GESTIÓN DEL SERVICIO",
    items: [
      { href: "/admin/usuarios", label: "Usuarios", description: "Gestión de usuarios registrados.", icon: Users, badge: 128 },
      { href: "/admin/estudiantes", label: "Estudiantes", description: "Información académica de estudiantes.", icon: GraduationCap },
      { href: "/admin/tareas", label: "Tareas registradas", description: "Tareas creadas en la plataforma.", icon: ClipboardList },
      { href: "/admin/proyectos", label: "Proyectos registrados", description: "Proyectos grupales activos.", icon: FolderKanban },
      { href: "/admin/soporte", label: "Soporte", description: "Consultas y tickets de usuarios.", icon: LifeBuoy, badge: 6 },
    ],
  },
  {
    title: "GESTIÓN EMPRESARIAL",
    items: [
      { href: "/admin/planes", label: "Planes y suscripciones", description: "Plan gratuito y Premium.", icon: CreditCard, badge: "24 Premium" },
      { href: "/admin/pagos", label: "Pagos", description: "Control de pagos e ingresos.", icon: Receipt, badge: "S/ 720" },
      { href: "/admin/marketing", label: "Marketing", description: "Campañas, promociones y captación.", icon: Megaphone },
      { href: "/admin/finanzas", label: "Finanzas", description: "Ingresos, costos y rentabilidad.", icon: Banknote },
      { href: "/admin/recursos-humanos", label: "Recursos humanos", description: "Equipo interno y roles.", icon: UserCog },
      { href: "/admin/logistica-digital", label: "Logística digital", description: "Nube, sincronización y actualizaciones.", icon: Cloud },
    ],
  },
  {
    title: "SISTEMA",
    items: [
      { href: "/admin/configuracion", label: "Configuración del sistema", description: "Ajustes generales del sistema.", icon: Settings },
    ],
  },
];

function SidebarContent({
  nombre,
  usuariosBadge,
  soporteBadge,
  premiumBadge,
  pagosBadge,
  onClose,
}: Omit<SidebarAdministradorProps, "open">) {
  const pathname = usePathname();

  const badgeResolver = (href: string, badge?: string | number) => {
    if (href === "/admin/usuarios") return usuariosBadge;
    if (href === "/admin/soporte") return soporteBadge;
    if (href === "/admin/planes") return premiumBadge ? `${premiumBadge} Premium` : badge;
    if (href === "/admin/pagos") return pagosBadge;
    return badge;
  };

  return (
    <div className="flex h-full flex-col bg-white text-slate-800 shadow-[0_20px_50px_rgba(15,23,42,0.08)] dark:bg-slate-950 dark:text-slate-100 dark:shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
      <div className="border-b border-slate-200 px-5 py-5 dark:border-white/10">
        <Link href="/admin" className="flex items-center gap-3" onClick={onClose}>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
            <ShieldCheck size={20} />
          </span>
          <div>
            <p className="text-base font-extrabold text-slate-900 dark:text-white">TaskUni Admin</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-300">Panel de administración</p>
          </div>
        </Link>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{nombre}</p>
          <p className="text-xs text-slate-500 dark:text-slate-300">Administrador general</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.title} className="mb-5">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
              {section.title}
            </p>
            <div className="mt-2 space-y-1">
              {section.items.map(({ href, label, description, icon: Icon, badge }) => {
                const active = pathname === href;
                const resolvedBadge = badgeResolver(href, badge);

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className={clsx(
                      "group flex items-start gap-3 rounded-2xl px-3 py-3 text-sm transition",
                      active
                        ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-500/15 dark:text-white dark:ring-indigo-400/30"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                    )}
                  >
                    <span
                      className={clsx(
                        "mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl transition",
                        active
                          ? "bg-indigo-500 text-white"
                          : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-700 dark:bg-white/5 dark:text-slate-300 dark:group-hover:bg-indigo-500/15 dark:group-hover:text-indigo-200"
                      )}
                    >
                      <Icon size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate font-medium">{label}</span>
                        {resolvedBadge !== undefined && resolvedBadge !== null ? (
                          <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-white/10 dark:text-indigo-100">
                            {resolvedBadge}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{description}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-white/10">
        <button
          type="button"
          onClick={() => {
            signOut({ redirect: false }).then(() => {
              window.location.href = "/";
            });
          }}
          className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-200">
              <LogOut size={17} />
            </span>
            Cerrar sesión
          </span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default function SidebarAdministrador(props: SidebarAdministradorProps) {
  const { open, onClose } = props;

  return (
    <>
      <aside className="hidden w-[272px] shrink-0 border-r border-slate-900/10 bg-slate-950 md:block md:h-[calc(100vh-5.5rem)] md:overflow-hidden md:sticky md:top-[5.5rem]">
        <SidebarContent {...props} onClose={onClose} />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Cerrar sidebar"
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="absolute left-0 top-0 h-full w-[88vw] max-w-[20rem] border-r border-slate-900/10 bg-slate-950 shadow-[20px_0_50px_rgba(15,23,42,0.35)]">
            <SidebarContent {...props} onClose={onClose} />
          </aside>
        </div>
      ) : null}
    </>
  );
}