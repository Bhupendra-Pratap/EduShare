import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const payload = getTokenFromRequest(request);
  if (!payload || !["ADMIN", "SUPER_ADMIN"].includes(payload.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action, rejectionReason } = await request.json();
  const status = action === "approve" ? "APPROVED" : "REJECTED";

  const verification = await prisma.verificationRequest.update({
    where: { id: params.id },
    data: { status, reviewedById: payload.userId, rejectionReason: rejectionReason || null },
  });

  // Update user status
  await prisma.user.update({
    where: { id: verification.userId },
    data: { verificationStatus: status },
  });

  return NextResponse.json({ success: true });
}
