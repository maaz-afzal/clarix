import connectDB from "@/lib/db";
import Comment from "@/models/Comment";
import Activity from "@/models/Activity";
import mongoose from "mongoose";

export interface CommentItem {
  _id: string;
  taskId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    _id: string;
    name: string;
    image?: string;
  };
}

export interface ActivityItem {
  _id: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    image?: string;
  };
}

export async function getTaskComments(taskId: string): Promise<CommentItem[]> {
  try {
    await connectDB();

    const comments = await Comment.find({
      taskId: new mongoose.Types.ObjectId(taskId),
    })
      .populate<{
        userId: {
          _id: mongoose.Types.ObjectId;
          name: string;
          image?: string;
        };
      }>("userId", "name image")
      .sort({ createdAt: 1 })
      .lean();

    return comments.map((c) => {
      const author = c.userId as {
        _id: mongoose.Types.ObjectId;
        name: string;
        image?: string;
      };
      return {
        _id: c._id.toString(),
        taskId: c.taskId.toString(),
        content: c.content,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        author: {
          _id: author._id.toString(),
          name: author.name,
          image: author.image,
        },
      };
    });
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    throw new Error("Failed to fetch comments");
  }
}

export async function getTaskActivity(taskId: string): Promise<ActivityItem[]> {
  try {
    await connectDB();

    const activities = await Activity.find({
      taskId: new mongoose.Types.ObjectId(taskId),
    })
      .populate<{
        userId: {
          _id: mongoose.Types.ObjectId;
          name: string;
          image?: string;
        };
      }>("userId", "name image")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return activities.map((a) => {
      const user = a.userId as {
        _id: mongoose.Types.ObjectId;
        name: string;
        image?: string;
      };
      return {
        _id: a._id.toString(),
        action: a.action,
        metadata: a.metadata as Record<string, unknown>,
        createdAt: a.createdAt.toISOString(),
        user: {
          _id: user._id.toString(),
          name: user.name,
          image: user.image,
        },
      };
    });
  } catch (error) {
    console.error("Failed to fetch activity:", error);
    return [];
  }
}
