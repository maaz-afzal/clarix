"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import { auth } from "@/lib/auth";
import { verifyWorkspaceMember } from "@/lib/authorization";
import mongoose from "mongoose";

interface NotificationResult {
  success: boolean;
  error?: string;
}

export async function markNotificationRead(
  workspaceSlug: string,
  notificationId: string,
): Promise<NotificationResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");

  await verifyWorkspaceMember(workspaceSlug);

  try {
    await connectDB();

    await Notification.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(notificationId),
        userId: new mongoose.Types.ObjectId(session.user.id),
      },
      { isRead: true },
    );

    revalidatePath(`/${workspaceSlug}/notifications`);

    return { success: true };
  } catch (error) {
    console.error("Mark read error:", error);
    return { success: false, error: "Notification cannot be marked as read" };
  }
}

export async function markAllRead(
  workspaceSlug: string,
  workspaceId: string,
): Promise<NotificationResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");

  await verifyWorkspaceMember(workspaceSlug);

  try {
    await connectDB();

    await Notification.updateMany(
      {
        userId: new mongoose.Types.ObjectId(session.user.id),
        workspaceId: new mongoose.Types.ObjectId(workspaceId),
        isRead: false,
      },
      { isRead: true },
    );

    revalidatePath(`/${workspaceSlug}/notifications`);

    return { success: true };
  } catch (error) {
    console.error("Mark all read error:", error);
    return { success: false, error: "Notifications cannot be marked as read" };
  }
}
