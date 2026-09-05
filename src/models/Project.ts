import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  color: string;
  status: "active" | "archived";
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: [150, "Name cannot exceed 150 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    color: {
      type: String,
      default: "#6366f1",
      match: [/^#[0-9a-fA-F]{6}$/, "Valid hex color is required"],
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

ProjectSchema.index({ workspaceId: 1, status: 1 });
ProjectSchema.index({ workspaceId: 1, createdAt: -1 });

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
