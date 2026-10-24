import connectDB from "@/lib/db";
import Attachment from "@/models/Attachment";
import mongoose from "mongoose";

export interface AttachmentItem {
  _id: string;
  url: string;
  fileName: string;
  fileSize: number;
  format: string;
  createdAt: string;
  uploadedBy: {
    name: string;
    image?: string;
  };
}

export async function getTaskAttachments(
  taskId: string,
): Promise<AttachmentItem[]> {
  try {
    await connectDB();

    const attachments = await Attachment.find({
      taskId: new mongoose.Types.ObjectId(taskId),
    })
      .populate<{
        uploadedBy: { name: string; image?: string };
      }>("uploadedBy", "name image")
      .sort({ createdAt: -1 })
      .lean();

    return attachments.map((a) => {
      const uploader = a.uploadedBy as { name: string; image?: string };
      return {
        _id: a._id.toString(),
        url: a.url,
        fileName: a.fileName,
        fileSize: a.fileSize,
        format: a.format,
        createdAt: a.createdAt.toISOString(),
        uploadedBy: { name: uploader.name, image: uploader.image },
      };
    });
  } catch (error) {
    console.error("Failed to fetch attachments:", error);
    return [];
  }
}
