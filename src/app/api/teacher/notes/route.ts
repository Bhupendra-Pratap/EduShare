import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload || !["TEACHER", "ADMIN", "SUPER_ADMIN"].includes(payload.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { verificationStatus: true },
  });
  if (user?.verificationStatus !== "APPROVED")
    return NextResponse.json({ error: "Account not verified" }, { status: 403 });

  const formData = await request.formData();
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const fileType = formData.get("fileType") as string;
  const topicId = formData.get("topicId") as string;
  const content = formData.get("content") as string;
  const linkUrl = formData.get("fileUrl") as string;
  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw ? JSON.parse(tagsRaw) : [];
  const file = formData.get("file") as File | null;

  let fileUrl: string | null = null;
  let fileName: string | null = null;
  let fileSize: number | null = null;

  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isPdf = file.name.toLowerCase().endsWith(".pdf");
    const resourceType = isPdf ? "raw" : "image";

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "edushare/notes",
            resource_type: resourceType,
            public_id: uuidv4(),
          },
          (err, result) => (err ? reject(err) : resolve(result))
        )
        .end(buffer);
    });
    fileUrl = result.secure_url;
    fileName = file.name;
    fileSize = file.size;
  } else if (linkUrl) {
    fileUrl = linkUrl;
  }

  // Teacher notes are auto-verified
  const note = await prisma.note.create({
    data: {
      title, description: description || null,
      content: content || null, fileUrl, fileName, fileSize,
      fileType: fileType as any, topicId, authorId: payload.userId,
      tags, isVerified: true, verifiedById: payload.userId,
    },
  });

  return NextResponse.json(note, { status: 201 });
}
