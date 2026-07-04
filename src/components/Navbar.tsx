"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand-700 dark:text-brand-300">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            T
          </span>
          TaskUni
        </Link>

        <nav className="flex items-center gap-3">
          <ThemeToggle compact />
          {session?.user ? (
            <>
              <span className="hidden text-sm text-slate-500 dark:text-slate-300 sm:inline">
                {session.user.name}
              </span>
              <Link
                href={session.user.rol === "administrador" ? "/admin" : "/dashboard"}
                className="btn-secondary"
              >
                Mi panel
              </Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="btn-primary">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary">
                Iniciar sesión
              </Link>
              <Link href="/registro" className="btn-primary">
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
