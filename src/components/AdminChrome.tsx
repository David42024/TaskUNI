"use client";

import { useState, type ReactNode } from "react";
import HeaderAdministrador, { type HeaderAdministradorProps } from "@/components/HeaderAdministrador";
import SidebarAdministrador, { type SidebarAdministradorProps } from "@/components/SidebarAdministrador";

type AdminChromeProps = {
  header: Omit<HeaderAdministradorProps, "onMenuClick">;
  sidebar: Omit<SidebarAdministradorProps, "open" | "onClose">;
  children: ReactNode;
};

export default function AdminChrome({ header, sidebar, children }: AdminChromeProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <HeaderAdministrador {...header} onMenuClick={() => setDrawerOpen(true)} />
      <div className="flex w-full items-start">
        <SidebarAdministrador {...sidebar} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <main className="min-h-[calc(100vh-5.5rem)] w-full min-w-0 flex-1 px-3 py-4 sm:px-4 lg:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}