import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload || !["ADMIN", "SUPER_ADMIN"].includes(payload.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, code, description, yearGroupId } = await request.json();
  if (!name || !code || !yearGroupId)
    return NextResponse.json({ error: "Name, code, yearGroupId required" }, { status: 400 });

  const subject = await prisma.subject.create({ data: { name, code, description, yearGroupId } });
  return NextResponse.json(subject, { status: 201 });
}
