import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import prisma from "@/lib/prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;
    const institutionId = formData.get("institutionId") as string;
    const departmentId = formData.get("departmentId") as string;
    const yearGroup = formData.get("yearGroup") as string;
    const idCard = formData.get("idCard") as File;

    if (!name || !email || !password || !role || !institutionId || !idCard) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const bytes = await idCard.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "edushare/notes", resource_type: "auto" },
          (err, result) => (err ? reject(err) : resolve(result))
        )
        .end(buffer);
    });
    const idCardUrl = (result as any).secure_url;

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name, email, password: hashed,
        role: role as any,
        institutionId: institutionId || null,
        departmentId: departmentId || null,
        yearGroup: yearGroup || null,
        idCardUrl,
        verificationStatus: "PENDING",
      },
    });

    // Create verification request
    await prisma.verificationRequest.create({
      data: { userId: user.id, institutionId, idCardUrl },
    });

    return NextResponse.json({ message: "Registration successful. Awaiting verification." }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
