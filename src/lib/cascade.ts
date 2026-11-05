import connectDB from "@/lib/db";
import Task from "@/models/Task";
import Comment from "@/models/Comment";
import Activity from "@/models/Activity";
import Attachment from "@/models/Attachment";
import mongoose from "mongoose";
import { deleteFile } from "@/lib/cloudinary";

export async function deleteTasksWithRelated(
  taskFilter: Record<string, unknown>,
): Promise<void> {
  await connectDB();

  const tasks = await Task.find(taskFilter).select("_id").lean();

  if (tasks.length === 0) return;

  const taskIds = tasks.map((t) => t._id);

  await Promise.all([
    Comment.deleteMany({ taskId: { $in: taskIds } }),
    Activity.deleteMany({ taskId: { $in: taskIds } }),
  ]);

  const attachments = await Attachment.find({ taskId: { $in: taskIds } })
    .select("publicId")
    .lean();

  if (attachments.length > 0) {
    const cloudinaryResults = await Promise.allSettled(
      attachments.map((a) => deleteFile(a.publicId)),
    );

    cloudinaryResults.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `Failed to delete Cloudinary file for attachment ${attachments[index]._id}:`,
          result.reason,
        );
      }
    });

    await Attachment.deleteMany({ taskId: { $in: taskIds } });
  }

  await Task.deleteMany({ _id: { $in: taskIds } });
}