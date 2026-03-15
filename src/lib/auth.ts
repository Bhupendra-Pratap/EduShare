import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import prisma from "./prisma";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "dev-secret-change-me";
const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "7d";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  institutionId?: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get("edushare_token")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      institutionId: true,
      departmentId: true,
      yearGroup: true,
      verificationStatus: true,
      avatar: true,
      bio: true,
      institution: { select: { name: true, code: true } },
      department: { select: { name: true, code: true } },
    },
  });

  return user;
}

export function getTokenFromRequest(request: NextRequest): JWTPayload | null {
  const token =
    request.cookies.get("edushare_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return null;
  return verifyToken(token);
}

export type SessionUser = Awaited<ReturnType<typeof getSession>>;
