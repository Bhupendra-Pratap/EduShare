import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload) return NextResponse.json([]);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { institutionId: true },
  });
  if (!user?.institutionId) return NextResponse.json([]);

  const topics = await prisma.topic.findMany({
    where: {
      subject: { yearGroup: { department: { institutionId: user.institutionId } } },
    },
    include: { subject: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(topics.map((t) => ({ id: t.id, name: t.name, subjectName: t.subject.name })));
}
