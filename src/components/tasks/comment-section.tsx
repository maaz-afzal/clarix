"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { formatRelativeTime } from "@/lib/utils";
import { addComment, deleteComment } from "@/actions/comment";
import {
  createCommentSchema,
  type CreateCommentInput,
} from "@/lib/validations/task";
import type { CommentItem } from "@/lib/dal/comments";

interface CommentSectionProps {
  comments: CommentItem[];
  workspaceSlug: string;
  taskId: string;
  projectId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserImage?: string;
  currentUserRole: string;
}

export default function CommentSection({
  comments,
  workspaceSlug,
  taskId,
  projectId,
  currentUserId,
  currentUserName,
  currentUserImage,
  currentUserRole,
}: CommentSectionProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCommentInput>({
    resolver: zodResolver(createCommentSchema),
  });

  function onSubmit(data: CreateCommentInput) {
    startTransition(async () => {
      const result = await addComment(workspaceSlug, taskId, data);
      if (!result.success) {
        toast.error(result.error || "Could not add comment");
        return;
      }
      reset();
    });
  }

  function handleDelete(commentId: string) {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    startTransition(async () => {
      const result = await deleteComment(
        workspaceSlug,
        commentId,
        taskId,
        projectId,
      );
      if (!result.success) toast.error(result.error || "Could not delete comment");
      else toast.success("Comment deleted successfully");
    });
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">
        Comments {comments.length > 0 && `(${comments.length})`}
      </h3>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : (
          comments.map((comment) => {
            const isAuthor = comment.author._id === currentUserId;
            const isAdmin = ["owner", "admin"].includes(currentUserRole);
            const canDelete = isAuthor || isAdmin;

            return (
              <div key={comment._id} className="flex gap-3">
                {/* Avatar */}
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden mt-0.5">
                  {comment.author.image ? (
                    <img
                      src={comment.author.image}
                      alt={comment.author.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-primary">
                      {comment.author.name[0].toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {comment.author.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(comment._id)}
                        disabled={isPending}
                        className="ml-auto text-xs text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add comment form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3">
        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden mt-1">
          {currentUserImage ? (
            <img
              src={currentUserImage}
              alt={currentUserName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs font-semibold text-primary">
              {currentUserName[0].toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex-1 space-y-1">
          <textarea
            {...register("content")}
            placeholder="Write a comment..."
            rows={2}
            disabled={isPending}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 resize-none"
          />
          {errors.content && (
            <p className="text-xs text-destructive">{errors.content.message}</p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {isPending ? (
              <span className="h-3 w-3 border border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
            Comment
          </button>
        </div>
      </form>
    </div>
  );
}
