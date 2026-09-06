import { getProjectById } from "@/lib/dal/project";
import { getTasksByProject } from "@/lib/dal/task";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    workspaceSlug: string;
    projectId: string;
  }>;
};

export default async function ProjectDetailPage({ params }: Props) {
  const { workspaceSlug, projectId } = await params;

  const [project, tasks] = await Promise.all([
    getProjectById(projectId),
    getTasksByProject(projectId),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">{project.name}</h1>

      <p className="text-muted-foreground mb-4">Workspace: {workspaceSlug}</p>

      <div className="rounded-lg border p-4">
        <p className="text-lg font-medium">Tasks: {tasks.length}</p>
      </div>
    </div>
  );
}
