import connectDB from "@/lib/db";
import Notification from "@/models/Notification";
import mongoose from "mongoose";

export interface NotificationItem {
  _id: string;
  type: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export async function getNotifications(
  userId: string,
  workspaceId: string,
  limit = 20,
): Promise<NotificationItem[]> {
  try {
    await connectDB();

    const notifications = await Notification.find({
      userId: new mongoose.Types.ObjectId(userId),
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return notifications.map((n) => ({
      _id: n._id.toString(),
      type: n.type,
      message: n.message,
      link: n.link,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}

export async function getUnreadCount(
  userId: string,
  workspaceId: string,
): Promise<number> {
  try {
    await connectDB();
    return await Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      workspaceId: new mongoose.Types.ObjectId(workspaceId),
      isRead: false,
    });
  } catch (error) {
    console.error("Failed to count notifications:", error);
    return 0;
  }
}
