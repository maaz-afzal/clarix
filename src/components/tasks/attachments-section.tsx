"use client";

import { useState, useTransition } from "react";
import { File, Image, Trash2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { formatRelativeTime } from "@/lib/utils";
import { deleteAttachment } from "@/actions/attachment";
import FileUploader from "./file-uploader";
import type { AttachmentItem } from "@/lib/dal/attachments";

interface AttachmentsSectionProps {
  initialAttachments: AttachmentItem[];
  workspaceSlug: string;
  taskId: string;
  projectId: string;
  currentUserId: string;
  currentUserRole: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentsSection({
  initialAttachments,
  workspaceSlug,
  taskId,
  projectId,
  currentUserId,
  currentUserRole,
}: AttachmentsSectionProps) {
  const [attachments, setAttachments] = useState(initialAttachments);
  const [isPending, startTransition] = useTransition();

  function handleUploaded(newAttachment: AttachmentItem) {
    setAttachments((prev) => [newAttachment, ...prev]);
  }

  function handleDelete(attachmentId: string) {
    if (!confirm("Delete this attachment?")) return;

    startTransition(async () => {
      const result = await deleteAttachment(
        workspaceSlug,
        attachmentId,
        taskId,
        projectId,
      );

      if (!result.success) {
        toast.error(result.error || "Failed to delete attachment");
        return;
      }

      setAttachments((prev) => prev.filter((a) => a._id !== attachmentId));
      toast.success("Attachment deleted successfully");
    });
  }

  const isImage = (format: string) =>
    ["jpg", "jpeg", "png", "gif", "webp"].includes(format.toLowerCase());

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Attachments ({attachments.length})
      </h3>

      <FileUploader
        workspaceSlug={workspaceSlug}
        taskId={taskId}
        onUploaded={handleUploaded as any}
      />

      {attachments.length > 0 && (
        <div className="space-y-2 mt-2">
          {attachments.map((attachment) => (
            <div
              key={attachment._id}
              className="flex items-center gap-2 p-2 border rounded-lg group"
            >
              {/* Icon */}
              <div className="shrink-0">
                {isImage(attachment.format) ? (
                  <div className="w-8 h-8 rounded overflow-hidden border">
                    <img
                      src={attachment.url}
                      alt={attachment.fileName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                    <File className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {attachment.fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.fileSize)} ·{" "}
                  {formatRelativeTime(attachment.createdAt)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleDelete(attachment._id)}
                  disabled={isPending}
                  className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
