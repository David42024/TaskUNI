import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";
import { guardarArchivo, TAMANO_MAXIMO_BYTES } from "@/lib/almacenamiento";

export async function GET(request: Request) {
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const idCurso = searchParams.get("curso");
  const idProyecto = searchParams.get("proyecto");

  const archivos = await prisma.archivo.findMany({
    where: {
      AND: [
        {
          OR: [
            { id_usuario: session.user.id },
            { proyecto: { integrantes: { some: { id_usuario: session.user.id } } } },
          ],
        },
        idCurso ? { id_curso: idCurso } : {},
        idProyecto ? { id_proyecto: idProyecto } : {},
      ],
    },
    include: {
      curso: { select: { id_curso: true, nombre_curso: true } },
      proyecto: { select: { id_proyecto: true, nombre_proyecto: true } },
    },
    orderBy: { fecha_subida: "desc" },
  });

  return NextResponse.json(archivos);
}

export async function POST(request: Request) {
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const archivo = formData.get("archivo");
    const idCurso = formData.get("id_curso");
    const idProyecto = formData.get("id_proyecto");

    if (!(archivo instanceof File)) {
      return NextResponse.json({ error: "Debes seleccionar un archivo" }, { status: 400 });
    }

    if (archivo.size === 0) {
      return NextResponse.json({ error: "El archivo está vacío" }, { status: 400 });
    }

    if (archivo.size > TAMANO_MAXIMO_BYTES) {
      return NextResponse.json({ error: "El archivo supera el límite de 25 MB" }, { status: 400 });
    }

    const idCursoValor = typeof idCurso === "string" && idCurso ? idCurso : null;
    const idProyectoValor = typeof idProyecto === "string" && idProyecto ? idProyecto : null;

    if (idCursoValor) {
      const curso = await prisma.curso.findFirst({
        where: { id_curso: idCursoValor, id_usuario: session.user.id },
      });
      if (!curso) {
        return NextResponse.json({ error: "Curso no encontrado" }, { status: 404 });
      }
    }

    if (idProyectoValor) {
      const proyecto = await prisma.proyecto.findFirst({
        where: {
          id_proyecto: idProyectoValor,
          OR: [
            { id_usuario_creador: session.user.id },
            { integrantes: { some: { id_usuario: session.user.id } } },
          ],
        },
      });
      if (!proyecto) {
        return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
      }
    }

    const buffer = Buffer.from(await archivo.arrayBuffer());
    const nombreArchivo = await guardarArchivo(session.user.id, archivo.name, buffer);

    const registro = await prisma.archivo.create({
      data: {
        id_usuario: session.user.id,
        id_curso: idCursoValor,
        id_proyecto: idProyectoValor,
        nombre_original: archivo.name,
        nombre_archivo: nombreArchivo,
        tipo_mime: archivo.type || "application/octet-stream",
        tamano_bytes: archivo.size,
      },
      include: {
        curso: { select: { id_curso: true, nombre_curso: true } },
        proyecto: { select: { id_proyecto: true, nombre_proyecto: true } },
      },
    });

    return NextResponse.json(registro, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 });
  }
}
