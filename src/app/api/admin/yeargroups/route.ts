import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload || !["ADMIN", "SUPER_ADMIN"].includes(payload.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { label, yearNumber, departmentId } = await request.json();
  if (!label || !departmentId)
    return NextResponse.json({ error: "Label and departmentId required" }, { status: 400 });

  const yg = await prisma.yearGroup.create({
    data: { label, yearNumber: yearNumber || 1, departmentId },
  });
  return NextResponse.json(yg, { status: 201 });
}
