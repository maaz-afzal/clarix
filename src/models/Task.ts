import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "in-review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assigneeId?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  dueDate?: Date;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [500, "Title cannot exceed 500 characters"],
    },
    description: {
      type: String,
      maxlength: [5000, "Description is too long"],
    },
    status: {
      type: String,
      enum: ["todo", "in-progress", "in-review", "done"],
      default: "todo",
    },
    priority: {
      type: String, 
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dueDate: {
      type: Date,
    },
    position: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

TaskSchema.index({ projectId: 1, status: 1 });
TaskSchema.index({ projectId: 1, position: 1 });
TaskSchema.index({ workspaceId: 1, assigneeId: 1 });
TaskSchema.index({ workspaceId: 1, dueDate: 1 });

const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;
