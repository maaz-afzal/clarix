import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadFile } from "@/lib/cloudinary";
import connectDB from "@/lib/db";
import Attachment from "@/models/Attachment";
import Task from "@/models/Task";
import WorkspaceMember from "@/models/WorkspaceMember";
import Workspace from "@/models/Workspace";
import mongoose from "mongoose";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAGIC_BYTES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png": [[0x89, 0x50, 0x4e, 0x47]],
  "image/gif": [[0x47, 0x49, 0x46, 0x38]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]],
  "application/pdf": [[0x25, 0x50, 0x44, 0x46]],
};

function verifyFileSignature(buffer: Buffer, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return true;

  return signatures.some((sig) =>
    sig.every((byte, index) => buffer[index] === byte),
  );
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const taskId = formData.get("taskId") as string | null;
    const workspaceSlug = formData.get("workspaceSlug") as string | null;

    if (!file || !taskId || !workspaceSlug) {
      return NextResponse.json(
        { error: "File, taskId, and workspaceSlug are required" },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size cannot exceed 5MB" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "This file type is not allowed" },
        { status: 400 },
      );
    }

    await connectDB();

    const workspace = await Workspace.findOne({ slug: workspaceSlug }).lean();
    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace not found" },
        { status: 404 },
      );
    }

    const member = await WorkspaceMember.findOne({
      workspaceId: workspace._id,
      userId: new mongoose.Types.ObjectId(session.user.id),
    }).lean();

    if (!member) {
      return NextResponse.json({ error: "No access" }, { status: 403 });
    }

    const task = await Task.findById(taskId).lean();
    if (!task || task.workspaceId.toString() !== workspace._id.toString()) {
      return NextResponse.json(
        { error: "Task not found or you don't have access" },
        { status: 404 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (MAGIC_BYTES[file.type] && !verifyFileSignature(buffer, file.type)) {
      return NextResponse.json(
        { error: "File is corrupted or of the wrong type" },
        { status: 400 },
      );
    }

    const uploadResult = await uploadFile(
      buffer,
      file.name,
      `clarix/${workspace.slug}/tasks`,
    );

    const attachment = await Attachment.create({
      taskId: new mongoose.Types.ObjectId(taskId),
      workspaceId: workspace._id,
      uploadedBy: new mongoose.Types.ObjectId(session.user.id),
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      fileName: file.name,
      fileSize: file.size,
      format: uploadResult.format,
    });

    return NextResponse.json({
      success: true,
      attachment: {
        _id: attachment._id.toString(),
        url: attachment.url,
        fileName: attachment.fileName,
        fileSize: attachment.fileSize,
        format: attachment.format,
        createdAt: attachment.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
}
