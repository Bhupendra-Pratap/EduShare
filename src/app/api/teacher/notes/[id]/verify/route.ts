import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const payload = getTokenFromRequest(request);
  if (!payload || !["TEACHER", "ADMIN", "SUPER_ADMIN"].includes(payload.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action } = await request.json();

  if (action === "approve") {
    await prisma.note.update({
      where: { id: params.id },
      data: { isVerified: true, verifiedById: payload.userId },
    });
  } else if (action === "reject") {
    await prisma.note.update({
      where: { id: params.id },
      data: { isPublic: false },
    });
  }

  return NextResponse.json({ success: true });
}
