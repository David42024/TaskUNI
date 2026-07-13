import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";
import { eliminarArchivoDisco, leerArchivo } from "@/lib/almacenamiento";

async function obtenerArchivoAccesible(id_archivo: string, id_usuario: string) {
  const archivo = await prisma.archivo.findFirst({
    where: {
      id_archivo,
      OR: [
        { id_usuario },
        { proyecto: { integrantes: { some: { id_usuario } } } },
      ],
    },
  });
  return archivo;
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const archivo = await obtenerArchivoAccesible(params.id, session.user.id);
  if (!archivo) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  try {
    const buffer = await leerArchivo(archivo.nombre_archivo);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": archivo.tipo_mime,
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(archivo.nombre_original)}`,
        "Content-Length": String(archivo.tamano_bytes),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "No se pudo leer el archivo" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const archivo = await prisma.archivo.findFirst({
    where: { id_archivo: params.id, id_usuario: session.user.id },
  });
  if (!archivo) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  await prisma.archivo.delete({ where: { id_archivo: params.id } });
  await eliminarArchivoDisco(archivo.nombre_archivo);

  return NextResponse.json({ message: "Archivo eliminado" });
}
