import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const institutions = await prisma.institution.findMany({
    where: { isActive: true },
    select: { id: true, name: true, code: true, logoUrl: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(institutions);
}
