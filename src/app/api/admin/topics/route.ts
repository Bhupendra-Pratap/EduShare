import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload || !["ADMIN", "SUPER_ADMIN"].includes(payload.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, subjectId } = await request.json();
  if (!name || !subjectId)
    return NextResponse.json({ error: "Name and subjectId required" }, { status: 400 });

  const topic = await prisma.topic.create({ data: { name, subjectId } });
  return NextResponse.json(topic, { status: 201 });
}
