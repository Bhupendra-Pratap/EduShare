import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { institutionId: true, verificationStatus: true },
  });
  if (!user || user.verificationStatus !== "APPROVED") return NextResponse.json([]);

  const { searchParams } = new URL(request.url);
  const topicId = searchParams.get("topicId");
  const verified = searchParams.get("verified");

  const notes = await prisma.note.findMany({
    where: {
      author: { institutionId: user.institutionId || "" },
      isPublic: true,
      ...(topicId ? { topicId } : {}),
      ...(verified === "1" ? { isVerified: true } : verified === "0" ? { isVerified: false } : {}),
    },
    include: {
      author: { select: { name: true, role: true } },
      topic: { include: { subject: { select: { name: true } } } },
      _count: { select: { votes: true, comments: true, bookmarks: true } },
    },
    orderBy: [{ isVerified: "asc" }, { createdAt: "desc" }],
    take: 40,
  });

  return NextResponse.json(notes.map((n) => ({ ...n, createdAt: n.createdAt.toISOString() })));
}
