import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload || !["ADMIN", "SUPER_ADMIN"].includes(payload.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, code, institutionId } = await request.json();
  if (!name || !code || !institutionId)
    return NextResponse.json({ error: "Name, code, institutionId required" }, { status: 400 });

  const dept = await prisma.department.create({ data: { name, code, institutionId } });
  return NextResponse.json(dept, { status: 201 });
}
