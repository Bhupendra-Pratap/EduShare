import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notes = await prisma.note.findMany({
    where: { authorId: payload.userId },
    include: {
      author: { select: { name: true, role: true } },
      topic: { include: { subject: { select: { name: true } } } },
      _count: { select: { votes: true, comments: true, bookmarks: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(notes.map(n => ({ ...n, createdAt: n.createdAt.toISOString() })));
}
