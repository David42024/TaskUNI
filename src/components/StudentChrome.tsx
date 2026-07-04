"use client";

import { useState, type ReactNode } from "react";
import HeaderEstudiante, { type HeaderEstudianteProps } from "@/components/HeaderEstudiante";
import SidebarEstudiante, { type SidebarEstudianteProps } from "@/components/SidebarEstudiante";

type StudentChromeProps = {
  header: Omit<HeaderEstudianteProps, "onMenuClick">;
  sidebar: Omit<SidebarEstudianteProps, "open" | "onClose">;
  children: ReactNode;
};

export default function StudentChrome({ header, sidebar, children }: StudentChromeProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <HeaderEstudiante {...header} onMenuClick={() => setDrawerOpen(true)} />
      <div className="flex w-full items-start">
        <SidebarEstudiante {...sidebar} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        <main className="min-h-[calc(100vh-5.5rem)] w-full min-w-0 flex-1 px-3 py-4 sm:px-4 lg:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}