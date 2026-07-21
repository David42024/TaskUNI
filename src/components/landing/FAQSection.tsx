"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    pregunta: "¿TaskUni se puede utilizar gratis?",
    respuesta:
      "Sí. El plan gratuito incluye registro de cuenta, gestión básica de tareas, calendario académico, recordatorios básicos y proyectos grupales limitados. No requiere tarjeta de crédito.",
  },
  {
    pregunta: "¿Puedo trabajar con mis compañeros?",
    respuesta:
      "Sí. TaskUni permite crear proyectos grupales, asignar tareas a integrantes y visualizar el avance de cada uno mediante tableros Kanban.",
  },
  {
    pregunta: "¿Necesito instalar una aplicación?",
    respuesta:
      "No. TaskUni funciona desde el navegador y se adapta a computadoras, tablets y celulares. No requiere instalación.",
  },
  {
    pregunta: "¿Qué incluye el plan Premium?",
    respuesta:
      "El plan Premium añade tareas ilimitadas, tableros Kanban avanzados, reportes de productividad, recordatorios inteligentes, mayor almacenamiento y analítica de rendimiento.",
  },
  {
    pregunta: "¿Cómo se protegen mis datos?",
    respuesta:
      "Las contraseñas se almacenan cifradas, el acceso está protegido por roles de usuario, las rutas privadas requieren autenticación y las sesiones se gestionan de forma segura.",
  },
  {
    pregunta: "¿Puedo cambiar de plan posteriormente?",
    respuesta:
      "Sí. Puedes empezar con el plan gratuito y migrar a Premium en cualquier momento desde la configuración de tu cuenta.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="scroll-mt-20 bg-white py-16 dark:bg-slate-950/40">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">
          Preguntas frecuentes
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-600 dark:text-slate-400">
          Resolvemos las dudas más comunes sobre TaskUni.
        </p>
        <div className="mt-10 space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            const panelId = `faq-panel-${i}`;
            const buttonId = `faq-button-${i}`;
            return (
              <div
                key={i}
                className="rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]"
              >
                <h3>
                  <button
                    id={buttonId}
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-slate-900 transition hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                  >
                    {faq.pregunta}
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    />
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!isOpen}
                  className={`overflow-hidden transition-all duration-200 ${
                    isOpen ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="border-t border-slate-100 px-5 pb-4 pt-3 text-sm text-slate-600 dark:border-white/10 dark:text-slate-400">
                    {faq.respuesta}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
