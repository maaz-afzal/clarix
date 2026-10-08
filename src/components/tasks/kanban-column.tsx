"use client";

import { useState, useMemo } from "react";
import { useDroppable, useDndContext } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import SortableTaskCard from "./sortable-task-card";
import CreateTaskForm from "./create-task-form";
import type { TaskItem } from "@/lib/dal/task";
import type { MemberWithUser } from "@/lib/dal/members";
import type { TaskStatus } from "./kanban-board";

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "bg-slate-500",
  "in-progress": "bg-blue-500",
  "in-review": "bg-purple-500",
  done: "bg-green-500",
};

const STATUS_OVER_BG: Record<TaskStatus, string> = {
  todo: "bg-slate-500/10 border-2 border-slate-500/30 border-dashed",
  "in-progress": "bg-blue-500/10 border-2 border-blue-500/30 border-dashed",
  "in-review": "bg-purple-500/10 border-2 border-purple-500/30 border-dashed",
  done: "bg-green-500/10 border-2 border-green-500/30 border-dashed",
};

interface KanbanColumnProps {
  column: { id: TaskStatus; title: string };
  tasks: TaskItem[];
  workspaceSlug: string;
  projectId: string;
  members: MemberWithUser[];
  canManage: boolean;
}

export default function KanbanColumn({
  column,
  tasks,
  workspaceSlug,
  projectId,
  members,
  canManage,
}: KanbanColumnProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { setNodeRef } = useDroppable({ id: column.id });
  const { over } = useDndContext();

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => a.position - b.position),
    [tasks],
  );

  const isOver =
    !!over &&
    (over.id === column.id || sortedTasks.some((t) => t._id === over.id));

  return (
    <div className="flex w-72 shrink-0 flex-col">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={cn("w-2 h-2 rounded-full", STATUS_COLORS[column.id])} />
        <h3 className="font-semibold text-sm">{column.title}</h3>
        <span
          className={cn(
            "text-xs rounded px-1.5 py-0.5 ml-auto",
            tasks.length === 0
              ? "bg-muted text-muted-foreground"
              : "bg-primary/10 text-primary",
          )}
        >
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-lg p-2 transition-colors min-h-32",
          isOver ? STATUS_OVER_BG[column.id] : "bg-muted/30",
        )}
      >
        <SortableContext
          items={sortedTasks.map((t) => t._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {sortedTasks.map((task) => (
              <SortableTaskCard
                key={task._id}
                task={task}
                workspaceSlug={workspaceSlug}
                projectId={projectId}
              />
            ))}
          </div>
        </SortableContext>

        {tasks.length === 0 && !isOver && (
          <p className="text-center text-xs text-muted-foreground py-8">
            No tasks
          </p>
        )}
      </div>

      {/* Add task button / form */}
      {canManage && (
        <div className="mt-2">
          {showCreateForm ? (
            <div className="bg-card border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium">New task</p>
                <button onClick={() => setShowCreateForm(false)}>
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
              <CreateTaskForm
                workspaceSlug={workspaceSlug}
                projectId={projectId}
                members={members.map((m) => ({
                  userId: m.userId,
                  user: { name: m.user.name, image: m.user.image },
                }))}
                defaultStatus={column.id}
                onSuccess={() => setShowCreateForm(false)}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add task
            </button>
          )}
        </div>
      )}
    </div>
  );
}
