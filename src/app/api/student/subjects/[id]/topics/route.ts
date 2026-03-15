import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const payload = getTokenFromRequest(request);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const topics = await prisma.topic.findMany({
    where: { subjectId: params.id },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(topics);
}
