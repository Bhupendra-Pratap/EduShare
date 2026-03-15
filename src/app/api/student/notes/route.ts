import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { verificationStatus: true, institutionId: true },
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

  if (!title || !topicId) return NextResponse.json({ error: "Title and topic required" }, { status: 400 });

  let fileUrl: string | null = null;
  let fileName: string | null = null;
  let fileSize: number | null = null;

  if (file && file.size > 0) {
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || "10485760");
    if (file.size > maxSize) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "edushare/notes", resource_type: "auto" },
          (err, result) => (err ? reject(err) : resolve(result))
        )
        .end(buffer);
    });
    fileUrl = (result as any).secure_url;
    fileName = file.name;
    fileSize = file.size;
  } else if (linkUrl) {
    fileUrl = linkUrl;
  }

  const note = await prisma.note.create({
    data: {
      title,
      description: description || null,
      content: content || null,
      fileUrl,
      fileName,
      fileSize,
      fileType: fileType as any,
      topicId,
      authorId: payload.userId,
      tags,
    },
  });

  return NextResponse.json(note, { status: 201 });
}

export async function GET(request: NextRequest) {
  const payload = getTokenFromRequest(request);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notes = await prisma.note.findMany({
    where: { authorId: payload.userId },
    include: {
      topic: { include: { subject: { select: { name: true } } } },
      _count: { select: { votes: true, comments: true, bookmarks: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(notes);
}
