import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bio } = await request.json();
  const user = await prisma.user.update({
    where: { id: payload.userId },
    data: { bio },
    select: { id: true, bio: true },
  });
  return NextResponse.json(user);
}
