import TaskModal from "@/components/tasks/task-modal";
import TaskDetailView from "@/components/tasks/task-detail-view";

type Props = {
  params: Promise<{
    workspaceSlug: string;
    projectId: string;
    taskId: string;
  }>;
};

export default async function InterceptedTaskPage({ params }: Props) {
  const { workspaceSlug, projectId, taskId } = await params;

  return (
    <TaskModal>
      <TaskDetailView
        workspaceSlug={workspaceSlug}
        projectId={projectId}
        taskId={taskId}
        variant="modal"
      />
    </TaskModal>
  );
}
