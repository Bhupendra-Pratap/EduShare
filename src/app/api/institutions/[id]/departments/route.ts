import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const departments = await prisma.department.findMany({
    where: { institutionId: params.id },
    select: { id: true, name: true, code: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(departments);
}
