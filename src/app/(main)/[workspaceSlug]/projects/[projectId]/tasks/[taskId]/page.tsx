import TaskDetailView from "@/components/tasks/task-detail-view";
import { getTaskById } from "@/lib/dal/task";
import type { Metadata } from "next";
import { getAuthorizedTaskTitle } from "@/lib/dal/metadata";

type Props = {
  params: Promise<{
    workspaceSlug: string;
    projectId: string;
    taskId: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { workspaceSlug, taskId } = await params;
  const title = await getAuthorizedTaskTitle(workspaceSlug, taskId);
  return { title: title ?? "Task" };
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
