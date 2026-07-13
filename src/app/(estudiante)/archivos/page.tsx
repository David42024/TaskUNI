"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Cloud,
  Download,
  File as FileIcon,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Folder,
  Trash2,
  UploadCloud,
} from "lucide-react";
import ModalConfirmacion from "@/components/ModalConfirmacion";

interface Curso {
  id_curso: string;
  nombre_curso: string;
}

interface Proyecto {
  id_proyecto: string;
  nombre_proyecto: string;
}

interface ArchivoVista {
  id_archivo: string;
  id_usuario: string;
  nombre_original: string;
  tipo_mime: string;
  tamano_bytes: number;
  fecha_subida: string;
  curso: { id_curso: string; nombre_curso: string } | null;
  proyecto: { id_proyecto: string; nombre_proyecto: string } | null;
}

function formatearTamano(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function IconoArchivo({ tipoMime }: { tipoMime: string }) {
  if (tipoMime.startsWith("image/")) return <FileImage className="text-emerald-600" size={18} />;
  if (tipoMime.startsWith("video/")) return <FileVideo className="text-rose-600" size={18} />;
  if (tipoMime.includes("sheet") || tipoMime.includes("excel") || tipoMime.includes("csv"))
    return <FileSpreadsheet className="text-green-700" size={18} />;
  if (tipoMime.includes("zip") || tipoMime.includes("compressed") || tipoMime.includes("rar"))
    return <FileArchive className="text-amber-600" size={18} />;
  if (tipoMime === "application/pdf" || tipoMime.includes("word") || tipoMime.includes("text"))
    return <FileText className="text-brand-600" size={18} />;
  return <FileIcon className="text-slate-500" size={18} />;
}

export default function ArchivosPage() {
  return (
    <Suspense fallback={<div className="card text-center text-slate-400">Cargando archivos...</div>}>
      <ArchivosContenido />
    </Suspense>
  );
}

function ArchivosContenido() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cursoIdFiltro = searchParams?.get("curso") ?? null;
  const proyectoIdFiltro = searchParams?.get("proyecto") ?? null;

  const [cursos, setCursos] = useState<Curso[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [archivos, setArchivos] = useState<ArchivoVista[]>([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [errorSubida, setErrorSubida] = useState("");
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [destino, setDestino] = useState("");
  const [idAEliminar, setIdAEliminar] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);

  async function cargarDatos() {
    setCargando(true);
    const params = new URLSearchParams();
    if (cursoIdFiltro) params.set("curso", cursoIdFiltro);
    if (proyectoIdFiltro) params.set("proyecto", proyectoIdFiltro);

    const [resCursos, resProyectos, resArchivos] = await Promise.all([
      fetch("/api/cursos"),
      fetch("/api/proyectos"),
      fetch(`/api/archivos?${params.toString()}`),
    ]);

    if (!resCursos.ok) {
      console.error("Error fetching cursos:", resCursos.status);
      setCargando(false);
      return;
    }
    setCursos(await resCursos.json());

    if (!resProyectos.ok) {
      console.error("Error fetching proyectos:", resProyectos.status);
      setCargando(false);
      return;
    }
    const proyectosData = await resProyectos.json();
    setProyectos(proyectosData.map((p: any) => ({ id_proyecto: p.id_proyecto, nombre_proyecto: p.nombre_proyecto })));

    if (!resArchivos.ok) {
      console.error("Error fetching archivos:", resArchivos.status);
      setCargando(false);
      return;
    }
    setArchivos(await resArchivos.json());
    setCargando(false);
  }

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursoIdFiltro, proyectoIdFiltro]);

  useEffect(() => {
    if (cursoIdFiltro) setDestino(`curso:${cursoIdFiltro}`);
    else if (proyectoIdFiltro) setDestino(`proyecto:${proyectoIdFiltro}`);
  }, [cursoIdFiltro, proyectoIdFiltro]);

  async function handleSubir(e: React.FormEvent) {
    e.preventDefault();
    setErrorSubida("");
    if (!archivoSeleccionado) {
      setErrorSubida("Selecciona un archivo primero");
      return;
    }

    const formData = new FormData();
    formData.append("archivo", archivoSeleccionado);
    if (destino.startsWith("curso:")) formData.append("id_curso", destino.replace("curso:", ""));
    if (destino.startsWith("proyecto:")) formData.append("id_proyecto", destino.replace("proyecto:", ""));

    setSubiendo(true);
    try {
      const res = await fetch("/api/archivos", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo subir el archivo");
      setArchivoSeleccionado(null);
      (document.getElementById("input-archivo") as HTMLInputElement | null)?.value &&
        ((document.getElementById("input-archivo") as HTMLInputElement).value = "");
      await cargarDatos();
    } catch (err: any) {
      setErrorSubida(err.message || "Ocurrió un error al subir el archivo");
    } finally {
      setSubiendo(false);
    }
  }

  async function handleEliminar() {
    if (!idAEliminar) return;
    setEliminando(true);
    await fetch(`/api/archivos/${idAEliminar}`, { method: "DELETE" });
    setEliminando(false);
    setIdAEliminar(null);
    await cargarDatos();
  }

  const espacioUsado = useMemo(
    () => archivos.reduce((total, a) => total + a.tamano_bytes, 0),
    [archivos]
  );

  const cursoFiltro = cursoIdFiltro ? cursos.find((c) => c.id_curso === cursoIdFiltro) : null;
  const proyectoFiltro = proyectoIdFiltro ? proyectos.find((p) => p.id_proyecto === proyectoIdFiltro) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Archivos académicos</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Materiales, recursos y documentación vinculada a tus cursos y proyectos.
        </p>
      </div>

      {(cursoFiltro || proyectoFiltro) && (
        <div className="card flex items-center justify-between gap-3 bg-brand-50 text-sm text-brand-700">
          <span>
            Mostrando archivos de <strong>{cursoFiltro?.nombre_curso ?? proyectoFiltro?.nombre_proyecto}</strong>
          </span>
          <button className="btn-secondary text-xs" onClick={() => router.push("/archivos")}>
            Ver todos
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-xs text-slate-400">Cursos</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{cursos.length}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-400">Proyectos</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{proyectos.length}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-400">Archivos · espacio usado</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {archivos.length} · {formatearTamano(espacioUsado)}
          </p>
        </div>
      </div>

      <div className="card space-y-3">
        <h3 className="flex items-center gap-2 font-semibold text-slate-800 dark:text-white">
          <UploadCloud size={18} className="text-brand-600" /> Subir un archivo
        </h3>
        {errorSubida && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorSubida}</div>}
        <form onSubmit={handleSubir} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="label">Archivo</label>
            <input
              id="input-archivo"
              type="file"
              className="input"
              onChange={(e) => setArchivoSeleccionado(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="label">Asociar a</label>
            <select className="input" value={destino} onChange={(e) => setDestino(e.target.value)}>
              <option value="">Sin categoría</option>
              {cursos.length > 0 && (
                <optgroup label="Cursos">
                  {cursos.map((c) => (
                    <option key={c.id_curso} value={`curso:${c.id_curso}`}>
                      {c.nombre_curso}
                    </option>
                  ))}
                </optgroup>
              )}
              {proyectos.length > 0 && (
                <optgroup label="Proyectos">
                  {proyectos.map((p) => (
                    <option key={p.id_proyecto} value={`proyecto:${p.id_proyecto}`}>
                      {p.nombre_proyecto}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={subiendo}>
            {subiendo ? "Subiendo..." : "Subir archivo"}
          </button>
        </form>
        <p className="text-xs text-slate-400">Tamaño máximo por archivo: 25 MB.</p>
      </div>

      <div className="card space-y-3">
        <h3 className="font-semibold text-slate-800 dark:text-white">Mis archivos</h3>
        {cargando ? (
          <p className="text-center text-slate-400">Cargando archivos...</p>
        ) : archivos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
            <Cloud className="mx-auto mb-2 text-brand-600" size={20} />
            Aún no subes archivos. Usa el formulario de arriba para agregar tu primer recurso.
          </div>
        ) : (
          <ul className="space-y-2">
            {archivos.map((a) => (
              <li
                key={a.id_archivo}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 dark:border-white/10"
              >
                <IconoArchivo tipoMime={a.tipo_mime} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-900 dark:text-white">{a.nombre_original}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatearTamano(a.tamano_bytes)}</span>
                    <span>·</span>
                    <span>{new Date(a.fecha_subida).toLocaleDateString("es-PE")}</span>
                    {a.curso && (
                      <span className="badge bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-200">
                        <Folder size={11} className="mr-1 inline" />
                        {a.curso.nombre_curso}
                      </span>
                    )}
                    {a.proyecto && (
                      <span className="badge bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-200">
                        <Folder size={11} className="mr-1 inline" />
                        {a.proyecto.nombre_proyecto}
                      </span>
                    )}
                  </div>
                </div>
                <a
                  href={`/api/archivos/${a.id_archivo}`}
                  className="btn-secondary text-xs"
                  title="Descargar"
                >
                  <Download size={14} />
                </a>
                {session?.user?.id === a.id_usuario && (
                  <button
                    onClick={() => setIdAEliminar(a.id_archivo)}
                    className="text-slate-300 hover:text-red-500"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <ModalConfirmacion
        abierto={Boolean(idAEliminar)}
        titulo="Eliminar archivo"
        mensaje="Esta acción no se puede deshacer. ¿Deseas continuar?"
        onConfirmar={handleEliminar}
        onCancelar={() => setIdAEliminar(null)}
        cargando={eliminando}
      />
    </div>
  );
}
