import { requireWorkspaceMember } from "@/lib/authorization";
import { getProjectById } from "@/lib/dal/project";
import { notFound } from "next/navigation";
import ProjectHeader from "@/components/projects/project-header";

type Props = {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string; projectId: string }>;
};

export default async function ProjectLayout({ children, params }: Props) {
  const { workspaceSlug, projectId } = await params;

  const { membership } = await requireWorkspaceMember(workspaceSlug);
  const project = await getProjectById(projectId);

  if (!project || project.workspaceId !== membership.workspaceId) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full">
      <ProjectHeader
        project={project}
        workspaceSlug={workspaceSlug}
        projectId={projectId}
      />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
