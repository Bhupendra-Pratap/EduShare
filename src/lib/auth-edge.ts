import { NextRequest } from "next/server";
import { jwtVerify } from "jose/jwt/verify";

export interface EdgeJWTPayload {
  userId: string;
  email: string;
  role: string;
  institutionId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET;

export async function verifyTokenEdge(token: string): Promise<EdgeJWTPayload | null> {
  if (!JWT_SECRET) return null;

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (typeof payload.userId !== "string" || typeof payload.email !== "string" || typeof payload.role !== "string") {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      institutionId: typeof payload.institutionId === "string" ? payload.institutionId : undefined,
    };
  } catch {
    return null;
  }
}

export async function getTokenFromRequestEdge(request: NextRequest): Promise<EdgeJWTPayload | null> {
  const token =
    request.cookies.get("edushare_token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) return null;
  return verifyTokenEdge(token);
}
