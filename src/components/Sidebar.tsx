"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  ListChecks,
  Users,
  CalendarDays,
  Bell,
  CreditCard,
  LifeBuoy,
  ShieldCheck,
} from "lucide-react";

const enlacesEstudiante = [
  { href: "/dashboard", label: "Resumen", icon: LayoutDashboard },
  { href: "/tareas", label: "Tareas", icon: ListChecks },
  { href: "/proyectos", label: "Proyectos grupales", icon: Users },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/planes", label: "Planes", icon: CreditCard },
  { href: "/soporte", label: "Soporte", icon: LifeBuoy },
];

const enlacesAdmin = [
  { href: "/admin", label: "Panel general", icon: ShieldCheck },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  { href: "/admin/soporte", label: "Soporte", icon: LifeBuoy },
];

export default function Sidebar({ rol }: { rol: "estudiante" | "administrador" }) {
  const pathname = usePathname();
  const enlaces = rol === "administrador" ? enlacesAdmin : enlacesEstudiante;

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
      <nav className="space-y-1">
        {enlaces.map(({ href, label, icon: Icon }) => {
          const activo = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                activo
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
