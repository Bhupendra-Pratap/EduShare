import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload || !["ADMIN", "SUPER_ADMIN"].includes(payload.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const isSuperAdmin = payload.role === "SUPER_ADMIN";

  const institutions = await prisma.institution.findMany({
    where: isSuperAdmin ? {} : { id: payload.institutionId || "" },
    include: { _count: { select: { users: true, departments: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(institutions);
}

// Only SUPER_ADMIN can create institutions
export async function POST(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload || payload.role !== "SUPER_ADMIN")
    return NextResponse.json({ error: "Only super admins can create institutions" }, { status: 403 });

  const { name, code, description, address, website, adminEmail } = await request.json();
  if (!name || !code) return NextResponse.json({ error: "Name and code required" }, { status: 400 });

  const existing = await prisma.institution.findUnique({ where: { code } });
  if (existing) return NextResponse.json({ error: "Institution code already exists" }, { status: 409 });

  let adminId: string | undefined;
  if (adminEmail) {
    let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!admin) {
      const tempPass = await bcrypt.hash("changeMe123!", 12);
      admin = await prisma.user.create({
        data: {
          email: adminEmail, name: "Institution Admin",
          password: tempPass, role: "ADMIN", verificationStatus: "APPROVED",
        },
      });
    } else {
      await prisma.user.update({ where: { id: admin.id }, data: { role: "ADMIN" } });
    }
    adminId = admin.id;
  }

  const institution = await prisma.institution.create({
    data: { name, code, description, address, website, adminId },
  });

  if (adminId) {
    await prisma.user.update({ where: { id: adminId }, data: { institutionId: institution.id } });
  }

  return NextResponse.json(institution, { status: 201 });
}
