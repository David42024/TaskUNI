import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registroSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const datos = registroSchema.parse(body);

    const correoNorm = datos.correo.toLowerCase().trim();

    const existente = await prisma.usuario.findUnique({
      where: { correo_norm: correoNorm },
    });

    if (existente) {
      return NextResponse.json(
        { error: "Ya existe una cuenta registrada con este correo." },
        { status: 409 }
      );
    }

    const contrasena_hash = await bcrypt.hash(datos.contrasena, 10);

    // Se asigna automáticamente el plan gratuito al registrarse
    let planGratuito = await prisma.plan.findFirst({
      where: { tipo_plan: "gratuito" },
    });

    if (!planGratuito) {
      planGratuito = await prisma.plan.create({
        data: {
          nombre_plan: "Plan Gratuito",
          descripcion: "Funciones esenciales para organizar tu vida universitaria.",
          precio_mensual: 0,
          tipo_plan: "gratuito",
        },
      });
    }

    const usuario = await prisma.usuario.create({
      data: {
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        correo: datos.correo,
        correo_norm: correoNorm,
        contrasena_hash,
        rol: "estudiante",
        perfil_estudiante: {
          create: {
            universidad: datos.universidad,
            carrera: datos.carrera,
            ciclo_academico: datos.ciclo_academico,
          },
        },
        suscripciones: {
          create: {
            id_plan: planGratuito.id_plan,
            estado_suscripcion: "activa",
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Cuenta creada exitosamente", id_usuario: usuario.id_usuario },
      { status: 201 }
    );
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Datos inválidos" },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Ocurrió un error al crear la cuenta." },
      { status: 500 }
    );
  }
}
