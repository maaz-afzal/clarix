"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import toast from "react-hot-toast";
import { updateTaskPositions } from "@/actions/task";
import KanbanColumn from "./kanban-column";
import TaskCard from "./task-card";
import type { TaskItem } from "@/lib/dal/task";
import type { MemberWithUser } from "@/lib/dal/members";

export type TaskStatus = "todo" | "in-progress" | "in-review" | "done";

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "in-review", title: "In Review" },
  { id: "done", title: "Done" },
];

interface KanbanBoardProps {
  tasks: TaskItem[];
  members: MemberWithUser[];
  workspaceSlug: string;
  projectId: string;
  currentUserId: string;
  canManage: boolean;
}

export default function KanbanBoard({
  tasks: initialTasks,
  members,
  workspaceSlug,
  projectId,
  currentUserId,
  canManage,
}: KanbanBoardProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [, startTransition] = useTransition();

  const snapshotRef = useRef<TaskItem[]>(initialTasks);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const getTasksByStatus = useCallback(
    (status: TaskStatus) => tasks.filter((t) => t.status === status),
    [tasks],
  );

  function handleDragStart(event: DragStartEvent) {
    snapshotRef.current = tasks;
    const task = tasks.find((t) => t._id === event.active.id);
    if (task) setActiveTask(task);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const dragged = tasks.find((t) => t._id === activeId);
    if (!dragged) return;

    const overIsColumn = COLUMNS.some((c) => c.id === overId);
    const overTask = tasks.find((t) => t._id === overId);
    const targetStatus = overIsColumn
      ? (overId as TaskStatus)
      : overTask?.status;

    if (!targetStatus) return;
    if (dragged.status === targetStatus) return;

    setTasks((prev) =>
      prev.map((t) =>
        t._id === activeId ? { ...t, status: targetStatus } : t,
      ),
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) {
      setTasks(snapshotRef.current);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const dragged = tasks.find((t) => t._id === activeId);
    if (!dragged) return;

    const overIsColumn = COLUMNS.some((c) => c.id === overId);
    const overTask = tasks.find((t) => t._id === overId);
    const targetStatus = overIsColumn
      ? (overId as TaskStatus)
      : (overTask?.status ?? dragged.status);

    const columnTasks = tasks
      .map((t) => (t._id === activeId ? { ...t, status: targetStatus } : t))
      .filter((t) => t.status === targetStatus)
      .sort((a, b) => a.position - b.position);

    const oldIndex = columnTasks.findIndex((t) => t._id === activeId);
    let newIndex = oldIndex;

    if (overIsColumn) {
      newIndex = columnTasks.length - 1;
    } else if (overTask && overId !== activeId) {
      const overIndex = columnTasks.findIndex((t) => t._id === overId);
      if (overIndex !== -1) newIndex = overIndex;
    }

    const reordered = arrayMove(columnTasks, oldIndex, newIndex);
    const prevTask = reordered[newIndex - 1];
    const nextTask = reordered[newIndex + 1];

    let newPosition: number;
    if (prevTask && nextTask) {
      newPosition = (prevTask.position + nextTask.position) / 2;
    } else if (nextTask) {
      newPosition = nextTask.position / 2;
    } else if (prevTask) {
      newPosition = prevTask.position + 1000;
    } else {
      newPosition = 1000;
    }

    setTasks((prev) =>
      prev.map((t) =>
        t._id === activeId
          ? { ...t, status: targetStatus, position: newPosition }
          : t,
      ),
    );

    startTransition(async () => {
      const result = await updateTaskPositions(workspaceSlug, [
        { taskId: activeId, position: newPosition, status: targetStatus },
      ]);

      if (!result.success) {
        toast.error("Position save nahi ho saka");
        setTasks(snapshotRef.current);
      }
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-full">
        {/* Board header */}
        <div className="border-b px-6 py-3 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
          </p>
          <p className="text-sm text-muted-foreground">
            Todo: {getTasksByStatus("todo").length} | In Progress:{" "}
            {getTasksByStatus("in-progress").length} | In Review:{" "}
            {getTasksByStatus("in-review").length} | Done:{" "}
            {getTasksByStatus("done").length}
          </p>
        </div>

        {/* Columns */}
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex gap-4 h-full min-w-max">
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={getTasksByStatus(column.id)}
                workspaceSlug={workspaceSlug}
                projectId={projectId}
                members={members}
                canManage={canManage}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating drag preview */}
      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            workspaceSlug={workspaceSlug}
            projectId={projectId}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
