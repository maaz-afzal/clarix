"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import toast from "react-hot-toast";
import { updateTask } from "@/actions/task";
import type { TaskItem } from "@/lib/dal/task";

interface TaskTitleEditorProps {
  task: TaskItem;
  workspaceSlug: string;
}

export default function TaskTitleEditor({
  task,
  workspaceSlug,
}: TaskTitleEditorProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [isPending, startTransition] = useTransition();

  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? "");
  }, [task.title, task.description]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription && descriptionTextareaRef.current) {
      descriptionTextareaRef.current.focus();
    }
  }, [isEditingDescription]);

  function saveTitle() {
    const trimmed = title.trim();
    if (!trimmed) {
      toast.error("Title cannot be empty");
      setTitle(task.title);
      setIsEditingTitle(false);
      return;
    }
    if (trimmed === task.title) {
      setIsEditingTitle(false);
      return;
    }

    startTransition(async () => {
      const result = await updateTask(workspaceSlug, task._id, {
        title: trimmed,
      });
      if (!result.success) {
        toast.error(result.error || "Could not update title");
        setTitle(task.title);
      } else {
        toast.success("Title updated");
      }
      setIsEditingTitle(false);
    });
  }

  function saveDescription() {
    const trimmed = description.trim();
    if (trimmed === (task.description ?? "").trim()) {
      setIsEditingDescription(false);
      return;
    }

    startTransition(async () => {
      const result = await updateTask(workspaceSlug, task._id, {
        description: trimmed || undefined,
      });
      if (!result.success) {
        toast.error(result.error || "Could not update description");
        setDescription(task.description ?? "");
      } else {
        toast.success("Description updated");
      }
      setIsEditingDescription(false);
    });
  }

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      saveTitle();
    } else if (e.key === "Escape") {
      setTitle(task.title);
      setIsEditingTitle(false);
    }
  }

  function handleDescriptionKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (e.key === "Escape") {
      setDescription(task.description ?? "");
      setIsEditingDescription(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Title */}
      {isEditingTitle ? (
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={handleTitleKeyDown}
          disabled={isPending}
          maxLength={500}
          className="w-full text-2xl font-bold bg-background border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        />
      ) : (
        <h1
          onClick={() => !isPending && setIsEditingTitle(true)}
          className="text-2xl font-bold cursor-pointer hover:bg-muted/50 rounded-lg px-1 -mx-1 transition-colors"
          title="Click to edit title"
        >
          {task.title}
        </h1>
      )}

      {/* Description */}
      {isEditingDescription ? (
        <textarea
          ref={descriptionTextareaRef}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={saveDescription}
          onKeyDown={handleDescriptionKeyDown}
          disabled={isPending}
          maxLength={5000}
          rows={4}
          placeholder="Add a description..."
          className="w-full text-muted-foreground bg-background border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 resize-y"
        />
      ) : (
        <p
          onClick={() => !isPending && setIsEditingDescription(true)}
          className={`cursor-pointer hover:bg-muted/50 rounded-lg px-1 -mx-1 transition-colors whitespace-pre-wrap ${
            task.description
              ? "text-muted-foreground"
              : "text-muted-foreground italic text-sm"
          }`}
          title="Click to edit description"
        >
          {task.description || "No description provided"}
        </p>
      )}

      {isPending && <p className="text-xs text-muted-foreground">Saving...</p>}
    </div>
  );
}
