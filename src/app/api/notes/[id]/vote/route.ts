import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const payload = getTokenFromRequest(request);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await prisma.vote.create({ data: { userId: payload.userId, noteId: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Already voted" }, { status: 409 });
  }
}
