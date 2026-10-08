"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./task-card";
import type { TaskItem } from "@/lib/dal/task";

interface SortableTaskCardProps {
  task: TaskItem;
  workspaceSlug: string;
  projectId: string;
}

export default function SortableTaskCard({ task, workspaceSlug, projectId }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
    >
      <TaskCard
        task={task}
        workspaceSlug={workspaceSlug}
        projectId={projectId}
        isDragging={isDragging}
        dragListeners={listeners}
      />
    </div>
  );
}
