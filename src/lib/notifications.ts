import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import mongoose from "mongoose";

interface CreateNotificationInput {
  userId: string;
  workspaceId: string;
  type: "assignment" | "comment" | "invitation" | "mention" | "due_date";
  message: string;
  link?: string;
}

export async function createNotification(
  input: CreateNotificationInput,
): Promise<void> {
  try {
    await connectDB();
    await Notification.create({
      userId: new mongoose.Types.ObjectId(input.userId),
      workspaceId: new mongoose.Types.ObjectId(input.workspaceId),
      type: input.type,
      message: input.message,
      link: input.link,
    });
  } catch (error) {
    console.error("Notification create error:", error);
  }
}
