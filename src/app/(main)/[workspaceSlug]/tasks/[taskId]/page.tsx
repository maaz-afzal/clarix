type Props = {
  params: Promise<{
    workspaceSlug: string;
    taskId: string;
  }>;
};

export default async function TaskDetailPage({ params }: Props) {
  const { workspaceSlug, taskId } = await params;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Task Detail</h1>
      <p className="text-muted-foreground">
        Workspace: {workspaceSlug} | Task: {taskId}
      </p>
    </div>
  );
}
