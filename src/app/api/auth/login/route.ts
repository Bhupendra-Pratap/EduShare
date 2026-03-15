import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true, email: true, name: true, password: true,
        role: true, institutionId: true, verificationStatus: true, isActive: true,
      },
    });

    if (!user || !user.isActive) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = signToken({ userId: user.id, email: user.email, role: user.role, institutionId: user.institutionId || undefined });
    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, verificationStatus: user.verificationStatus },
    });
    response.cookies.set("edushare_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
