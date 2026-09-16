import { requireWorkspaceMember } from "@/lib/authorization";
import { getProjectsByWorkspace } from "@/lib/dal/project";
import ProjectCard from "@/components/projects/project-card";
import CreateProjectDialog from "@/components/projects/create-project-dialog";
import { hasPermission } from "@/lib/authorization";
import type { MemberRole } from "@/lib/authorization";

type Props = {
  params: Promise<{ workspaceSlug: string }>;
};

export default async function ProjectsPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const { membership } = await requireWorkspaceMember(workspaceSlug);
  const projects = await getProjectsByWorkspace(membership.workspaceId);

  const canCreateProject = hasPermission(
    membership.role as MemberRole,
    "project_create",
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>

        {canCreateProject && (
          <CreateProjectDialog workspaceSlug={workspaceSlug} />
        )}
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium">No projects found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {canCreateProject
              ? "Create your first project"
              : "There are no projects yet"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              workspaceSlug={workspaceSlug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
