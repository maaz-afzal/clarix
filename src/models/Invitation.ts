import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInvitation extends Document {
  _id: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  email: string;
  role: "admin" | "member";
  token: string;
  status: "pending" | "accepted" | "expired";
  invitedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  expiresAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired"],
      default: "pending",
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

InvitationSchema.index({ workspaceId: 1, email: 1 });
InvitationSchema.index({ token: 1 });
InvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Invitation: Model<IInvitation> =
  mongoose.models.Invitation ||
  mongoose.model<IInvitation>("Invitation", InvitationSchema);

export default Invitation;
