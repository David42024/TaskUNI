import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSesionActual } from "@/lib/session";
import { eventoSchema } from "@/lib/validations";

export async function GET() {
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    // 1. Fetch custom events
    const customEvents = await prisma.eventoCalendario.findMany({
      where: { id_usuario: session.user.id },
    });
    const mappedCustomEvents = customEvents.map((ev) => ({
      id_evento: ev.id_evento,
      titulo: ev.titulo,
      descripcion: ev.descripcion,
      tipo_evento: ev.tipo_evento,
      fecha_inicio: ev.fecha_inicio.toISOString(),
      ubicacion: ev.ubicacion,
      isReadOnly: false,
    }));

    // 2. Fetch personal tasks with due dates
    const personalTasks = await prisma.tarea.findMany({
      where: { id_usuario: session.user.id, fecha_limite: { not: null } },
    });
    const mappedPersonalTasks = personalTasks.map((t) => ({
      id_evento: `tarea-${t.id_tarea}`,
      titulo: `Tarea: ${t.titulo}`,
      descripcion: t.descripcion,
      tipo_evento: "entrega",
      fecha_inicio: t.fecha_limite!.toISOString(),
      ubicacion: null,
      isReadOnly: true,
    }));

    // 3. Fetch active projects with delivery dates
    const projects = await prisma.proyecto.findMany({
      where: {
        OR: [
          { id_usuario_creador: session.user.id },
          { integrantes: { some: { id_usuario: session.user.id, estado: "activo" } } },
        ],
        fecha_entrega: { not: null },
      },
    });
    const mappedProjects = projects.map((p) => ({
      id_evento: `proyecto-${p.id_proyecto}`,
      titulo: `Entrega Proyecto: ${p.nombre_proyecto}`,
      descripcion: p.descripcion,
      tipo_evento: "entrega",
      fecha_inicio: p.fecha_entrega!.toISOString(),
      ubicacion: null,
      isReadOnly: true,
    }));

    // 4. Fetch group tasks with due dates
    const projectIds = projects.map((p) => p.id_proyecto);
    const groupTasks = await prisma.tareaProyecto.findMany({
      where: {
        id_proyecto: { in: projectIds },
        fecha_limite: { not: null },
      },
      include: { proyecto: { select: { nombre_proyecto: true } } },
    });
    const mappedGroupTasks = groupTasks.map((t) => ({
      id_evento: `tarea-proyecto-${t.id_tarea_proyecto}`,
      titulo: `Proyecto [${t.proyecto.nombre_proyecto}]: ${t.titulo}`,
      descripcion: t.descripcion,
      tipo_evento: "entrega",
      fecha_inicio: t.fecha_limite!.toISOString(),
      ubicacion: null,
      isReadOnly: true,
    }));

    // Combine all
    const allEvents = [
      ...mappedCustomEvents,
      ...mappedPersonalTasks,
      ...mappedProjects,
      ...mappedGroupTasks,
    ];

    // Sort by fecha_inicio ascending
    allEvents.sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime());

    return NextResponse.json(allEvents);
  } catch (err: any) {
    return NextResponse.json({ error: "Error al cargar los eventos del calendario" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSesionActual();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const datos = eventoSchema.parse(body);

    const evento = await prisma.eventoCalendario.create({
      data: {
        id_usuario: session.user.id,
        titulo: datos.titulo,
        descripcion: datos.descripcion || null,
        tipo_evento: datos.tipo_evento,
        fecha_inicio: new Date(datos.fecha_inicio),
        fecha_fin: datos.fecha_fin ? new Date(datos.fecha_fin) : null,
        ubicacion: datos.ubicacion || null,
      },
    });

    return NextResponse.json(evento, { status: 201 });
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: error.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al crear el evento" }, { status: 500 });
  }
}
