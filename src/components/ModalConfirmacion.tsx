"use client";

interface Props {
  abierto: boolean;
  titulo: string;
  mensaje: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  cargando?: boolean;
}

export default function ModalConfirmacion({
  abierto,
  titulo,
  mensaje,
  onConfirmar,
  onCancelar,
  cargando,
}: Props) {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm dark:bg-slate-950/70">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-slate-900">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{titulo}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{mensaje}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancelar} className="btn-secondary" disabled={cargando}>
            Cancelar
          </button>
          <button onClick={onConfirmar} className="btn-danger" disabled={cargando}>
            {cargando ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
