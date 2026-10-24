"use client";

import { useState, useRef } from "react";
import { Upload, X, File, Image, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  workspaceSlug: string;
  taskId: string;
  onUploaded: (attachment: {
    _id: string;
    url: string;
    fileName: string;
    fileSize: number;
    format: string;
    createdAt: string;
  }) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileUploader({
  workspaceSlug,
  taskId,
  onUploaded,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is larger than 5MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("taskId", taskId);
      formData.append("workspaceSlug", workspaceSlug);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to upload file");
        return;
      }

      onUploaded(data.attachment);
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50",
        isUploading && "opacity-50 pointer-events-none",
      )}
      onClick={() => !isUploading && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        accept="image/*,.pdf,.txt,.doc,.docx"
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Uploading...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="w-5 h-5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Click or drag to attach a file
          </p>
          <p className="text-xs text-muted-foreground/60">
            Max 5MB - Images, PDF, TXT, DOC
          </p>
        </div>
      )}
    </div>
  );
}
