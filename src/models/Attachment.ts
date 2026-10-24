import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttachment extends Document {
  _id: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  uploadedBy: mongoose.Types.ObjectId;
  url: string;
  publicId: string;
  fileName: string;
  fileSize: number;
  format: string;
  createdAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    format: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

AttachmentSchema.index({ taskId: 1 });
AttachmentSchema.index({ workspaceId: 1 });

const Attachment: Model<IAttachment> =
  mongoose.models.Attachment ||
  mongoose.model<IAttachment>("Attachment", AttachmentSchema);

export default Attachment;
