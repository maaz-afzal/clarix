import mongoose, { Schema, Document, Model } from "mongoose";

export type MemberRole = "owner" | "admin" | "member";

export interface IWorkspaceMember extends Document {
  _id: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: MemberRole;
  joinedAt: Date;
}

const WorkspaceMemberSchema = new Schema<IWorkspaceMember>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  },
);

WorkspaceMemberSchema.index({ workspaceId: 1, userId: 1 }, { unique: true });

const WorkspaceMember: Model<IWorkspaceMember> =
  mongoose.models.WorkspaceMember ||
  mongoose.model<IWorkspaceMember>("WorkspaceMember", WorkspaceMemberSchema);

export default WorkspaceMember;
