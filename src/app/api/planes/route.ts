import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const planes = await prisma.plan.findMany({ orderBy: { precio_mensual: "asc" } });
  return NextResponse.json(planes);
}
