import TaskDetailView from "@/components/tasks/task-detail-view";
import { getTaskById } from "@/lib/dal/task";
import type { Metadata } from "next";

type Props = {
  params: Promise<{
    workspaceSlug: string;
    projectId: string;
    taskId: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { taskId } = await params;
  const task = await getTaskById(taskId);
  return { title: task?.title ?? "Task" };
}

export default async function TaskDetailPage({ params }: Props) {
  const { workspaceSlug, projectId, taskId } = await params;

  return (
    <TaskDetailView
      workspaceSlug={workspaceSlug}
      projectId={projectId}
      taskId={taskId}
      variant="page"
    />
  );
}
