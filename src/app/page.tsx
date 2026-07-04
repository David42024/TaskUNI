import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  ListChecks,
  Users,
  CalendarDays,
  Bell,
  BarChart3,
  ShieldCheck,
  Check,
} from "lucide-react";

const funciones = [
  {
    icon: ListChecks,
    titulo: "Gestión de tareas",
    descripcion: "Crea, prioriza y da seguimiento a tus tareas académicas por curso y fecha límite.",
  },
  {
    icon: Users,
    titulo: "Proyectos grupales",
    descripcion: "Coordina equipos, asigna responsabilidades y visualiza el avance con tableros Kanban.",
  },
  {
    icon: CalendarDays,
    titulo: "Calendario académico",
    descripcion: "Visualiza entregas, exámenes y reuniones en un calendario mensual centralizado.",
  },
  {
    icon: Bell,
    titulo: "Recordatorios inteligentes",
    descripcion: "Recibe alertas antes de que tus tareas y proyectos venzan.",
  },
  {
    icon: BarChart3,
    titulo: "Reportes de productividad",
    descripcion: "Mide tu cumplimiento, rachas de trabajo y progreso semanal.",
  },
  {
    icon: ShieldCheck,
    titulo: "Seguridad de tus datos",
    descripcion: "Cuentas protegidas, contraseñas cifradas y control de acceso por roles.",
  },
];

const planes = [
  {
    nombre: "Plan Gratuito",
    precio: "S/ 0",
    descripcion: "Ideal para empezar a organizar tu vida universitaria.",
    beneficios: [
      "Registro de cuenta",
      "Tareas y prioridades básicas",
      "Calendario académico",
      "Recordatorios básicos",
      "Proyectos grupales limitados",
    ],
    destacado: false,
  },
  {
    nombre: "Plan Premium",
    precio: "S/ 19.90/mes",
    descripcion: "Funciones avanzadas para equipos y estudiantes exigentes.",
    beneficios: [
      "Tareas ilimitadas",
      "Tableros Kanban avanzados",
      "Reportes de productividad",
      "Recordatorios inteligentes",
      "Mayor almacenamiento en la nube",
      "Analítica de rendimiento",
    ],
    destacado: true,
  },
];

export default function LandingPage() {
  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="badge bg-brand-100 text-brand-700">
              Plataforma académica digital
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
              Organiza tu vida universitaria en un solo lugar
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              TaskUni centraliza tus tareas, fechas de entrega, proyectos grupales,
              recordatorios y productividad académica, para que dejes de depender de
              notas, chats y hojas de cálculo dispersas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/registro" className="btn-primary px-6 py-3 text-base">
                Crear cuenta gratis
              </Link>
              <Link href="#planes" className="btn-secondary px-6 py-3 text-base">
                Ver planes
              </Link>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white">
            <p className="text-sm uppercase tracking-wide text-brand-100">Resumen semanal</p>
            <p className="mt-2 text-3xl font-bold">8 de 12 tareas completadas</p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div className="h-full w-2/3 rounded-full bg-white" />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-brand-100">Proyectos activos</p>
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-xs text-brand-100">Racha de días</p>
              </div>
              <div>
                <p className="text-2xl font-bold">67%</p>
                <p className="text-xs text-brand-100">Cumplimiento</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problema / Solución */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">El problema</h2>
              <p className="mt-3 text-slate-600">
                Los estudiantes usan notas, calendarios, grupos de mensajería y hojas de
                cálculo por separado. Esto genera desorganización, pérdida de información,
                incumplimiento de plazos y dificultad para coordinar trabajos grupales.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">La solución</h2>
              <p className="mt-3 text-slate-600">
                TaskUni centraliza tareas, proyectos, calendario y recordatorios en una
                sola plataforma web y móvil, diseñada específicamente para la vida
                universitaria y el trabajo colaborativo entre compañeros.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Funciones */}
      <section id="funciones" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-slate-900">Funciones principales</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-slate-600">
            Todo lo que necesitas para mantener el control de tus estudios y tus equipos.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {funciones.map(({ icon: Icon, titulo, descripcion }) => (
              <div key={titulo} className="card">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{titulo}</h3>
                <p className="mt-1 text-sm text-slate-600">{descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planes */}
      <section id="planes" className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-slate-900">Planes</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-slate-600">
            Empieza gratis y actualiza cuando necesites más funciones.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {planes.map((p) => (
              <div
                key={p.nombre}
                className={clsxPlan(p.destacado)}
              >
                {p.destacado && (
                  <span className="badge mb-3 bg-white/20 text-white">Más elegido</span>
                )}
                <h3 className={p.destacado ? "text-xl font-bold text-white" : "text-xl font-bold text-slate-900"}>
                  {p.nombre}
                </h3>
                <p className={p.destacado ? "mt-1 text-brand-100" : "mt-1 text-slate-500"}>
                  {p.descripcion}
                </p>
                <p className={p.destacado ? "mt-4 text-3xl font-bold text-white" : "mt-4 text-3xl font-bold text-slate-900"}>
                  {p.precio}
                </p>
                <ul className="mt-6 space-y-2">
                  {p.beneficios.map((b) => (
                    <li
                      key={b}
                      className={
                        "flex items-center gap-2 text-sm " +
                        (p.destacado ? "text-brand-50" : "text-slate-600")
                      }
                    >
                      <Check size={16} className={p.destacado ? "text-white" : "text-brand-600"} />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/registro"
                  className={p.destacado ? "btn-secondary mt-6 w-full bg-white text-brand-700 hover:bg-brand-50" : "btn-primary mt-6 w-full"}
                >
                  Comenzar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto / CTA final */}
      <section id="contacto" className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold text-slate-900">
            ¿Listo para organizar tu vida universitaria?
          </h2>
          <p className="mt-3 text-slate-600">
            Crea tu cuenta gratuita en minutos y empieza a centralizar tus tareas, proyectos y
            recordatorios.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/registro" className="btn-primary px-6 py-3 text-base">
              Crear cuenta gratis
            </Link>
            <Link href="/soporte" className="btn-secondary px-6 py-3 text-base">
              Contactar soporte
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} TaskUni. Plataforma académica digital para estudiantes universitarios.
      </footer>
    </div>
  );
}

function clsxPlan(destacado: boolean) {
  return destacado
    ? "card bg-gradient-to-br from-brand-600 to-brand-800 border-0"
    : "card";
}
