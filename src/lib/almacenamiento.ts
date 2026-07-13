import { randomUUID } from "crypto";
import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";

const DIRECTORIO_BASE = path.join(process.cwd(), "storage", "uploads");
export const TAMANO_MAXIMO_BYTES = 25 * 1024 * 1024; // 25 MB

function nombreSeguro(idUsuario: string, nombreOriginal: string) {
  const extension = path.extname(nombreOriginal).slice(0, 20);
  return `${idUsuario}/${randomUUID()}${extension}`;
}

export async function guardarArchivo(idUsuario: string, nombreOriginal: string, buffer: Buffer) {
  const nombreArchivo = nombreSeguro(idUsuario, nombreOriginal);
  const rutaCompleta = path.join(DIRECTORIO_BASE, nombreArchivo);
  await mkdir(path.dirname(rutaCompleta), { recursive: true });
  await writeFile(rutaCompleta, buffer);
  return nombreArchivo;
}

export async function leerArchivo(nombreArchivo: string) {
  const rutaCompleta = path.join(DIRECTORIO_BASE, nombreArchivo);
  return readFile(rutaCompleta);
}

export async function eliminarArchivoDisco(nombreArchivo: string) {
  const rutaCompleta = path.join(DIRECTORIO_BASE, nombreArchivo);
  await unlink(rutaCompleta).catch(() => undefined);
}
