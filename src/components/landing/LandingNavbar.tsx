"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Funciones", href: "#funciones" },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Planes", href: "#planes" },
  { label: "Preguntas frecuentes", href: "#faq" },
];

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-slate-950/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-brand-700 dark:text-brand-300"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm text-white">
            T
          </span>
          TaskUni
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-slate-600 transition hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/login" className="btn-secondary text-sm">
            Iniciar sesión
          </Link>
          <Link href="/registro" className="btn-primary text-sm">
            Crear cuenta gratis
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-white/10"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-200 bg-white px-4 pb-4 pt-2 dark:border-white/10 dark:bg-slate-950 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleClick}
              className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}
          <hr className="my-2 border-slate-200 dark:border-white/10" />
          <Link
            href="/login"
            onClick={handleClick}
            className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            onClick={handleClick}
            className="btn-primary mt-2 w-full justify-center text-sm"
          >
            Crear cuenta gratis
          </Link>
        </nav>
      )}
    </header>
  );
}
