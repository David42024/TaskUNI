import {
  Users,
  Briefcase,
  Building2,
  Activity,
  User,
  ChevronRight,
} from "lucide-react";

const equipo = [
  { nombre: "Valeria Ponce", area: "Desarrollo", rol: "Full Stack", carga: "Alta" },
  { nombre: "Diego Ramos", area: "Diseño UX/UI", rol: "Product Designer", carga: "Media" },
  { nombre: "María Santos", area: "Marketing", rol: "Growth Specialist", carga: "Media" },
  { nombre: "Luis Herrera", area: "Soporte", rol: "Customer Success", carga: "Alta" },
  { nombre: "Ana Medina", area: "Finanzas", rol: "Analista", carga: "Baja" },
  { nombre: "Carlos Vega", area: "Administración", rol: "Administrador general", carga: "Alta" },
];

const configCarga: Record<
  string,
  { label: string; bg: string; text: string; dot: string; width: string }
> = {
  Alta: {
    label: "Alta",
    bg: "bg-red-50 dark:bg-red-500/10",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-400",
    width: "w-4/5",
  },
  Media: {
    label: "Media",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-400",
    width: "w-3/5",
  },
  Baja: {
    label: "Baja",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-300",
    dot: "bg-emerald-400",
    width: "w-1/5",
  },
};

const areaColors: Record<string, string> = {
  Desarrollo: "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/20",
  "Diseño UX/UI": "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20",
  Marketing: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-500/10 dark:text-pink-300 dark:border-pink-500/20",
  Soporte: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20",
  Finanzas: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20",
  Administración: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-slate-300 dark:border-white/10",
};

const areaIcons: Record<string, typeof Briefcase> = {
  Desarrollo: Briefcase,
  "Diseño UX/UI": Briefcase,
  Marketing: Activity,
  Soporte: Users,
  Finanzas: Building2,
  Administración: Building2,
};

function getInitials(nombre: string) {
  return nombre
    .split(" ")
    .map((p) => p.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function AdminRRHHPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          <Users size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Recursos humanos
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Equipo interno y asignación de responsabilidades.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {equipo.map((m) => {
          const carga = configCarga[m.carga];
          const AreaIcon = areaIcons[m.area] || Briefcase;

          return (
            <div
              key={m.nombre}
              className="group card relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300 dark:hover:shadow-black/20 dark:hover:border-white/20"
            >
              <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-gradient-to-br from-transparent to-black/5 dark:to-white/5 opacity-50 group-hover:scale-150 transition-transform duration-500" />

              <div className="relative z-10">
                <div className="mb-1 inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:bg-white/10 dark:text-slate-500">
                  <User size={10} />
                  Colaborador
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-md shadow-brand-500/20">
                    {getInitials(m.nombre)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                      {m.nombre}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {m.rol}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${areaColors[m.area]}`}
                  >
                    <AreaIcon size={12} />
                    {m.area}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Carga de trabajo
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${carga.bg} ${carga.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${carga.dot}`} />
                      {carga.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${carga.width} ${
                        m.carga === "Alta"
                          ? "bg-red-400"
                          : m.carga === "Media"
                          ? "bg-amber-400"
                          : "bg-emerald-400"
                      }`}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
                  <button className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-brand-600 dark:text-slate-500 dark:hover:text-brand-400">
                    Ver información
                    <ChevronRight
                      size={13}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
