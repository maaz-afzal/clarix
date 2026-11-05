import { requireWorkspaceMember, hasPermission } from "@/lib/authorization";
import { getProjectsByWorkspace } from "@/lib/dal/project";
import ProjectCard from "@/components/projects/project-card";
import CreateProjectDialog from "@/components/projects/create-project-dialog";
import { FolderKanban } from "lucide-react";
import EmptyState from "@/components/shared/empty-state";
import type { MemberRole } from "@/lib/authorization";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Projects" };

type Props = {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{ archived?: string }>;
};

export default async function ProjectsPage({ params, searchParams }: Props) {
  const { workspaceSlug } = await params;
  const { archived } = await searchParams;

  const { membership } = await requireWorkspaceMember(workspaceSlug);

  const canManage = hasPermission(
    membership.role as MemberRole,
    "project_update",
  );
  const canCreate = hasPermission(
    membership.role as MemberRole,
    "project_create",
  );

  const showArchived = archived === "true";

  const projects = await getProjectsByWorkspace(
    membership.workspaceId,
    showArchived ? "archived" : "active",
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {projects.length} {showArchived ? "archived" : "active"} project
            {projects.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Archive toggle */}
          <a
            href={`/${workspaceSlug}/projects${showArchived ? "" : "?archived=true"}`}
            className="text-sm text-muted-foreground hover:text-foreground
            transition-colors"
          >
            {showArchived ? "Active projects" : "Archived"}
          </a>

          {canCreate && !showArchived && (
            <CreateProjectDialog workspaceSlug={workspaceSlug} />
          )}
        </div>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={showArchived ? "No archived projects" : "No projects yet"}
          description={
            showArchived
              ? "Archived projects will appear here."
              : canCreate
                ? "Create your first project to start adding tasks."
                : "There are no active projects at the moment."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              workspaceSlug={workspaceSlug}
              canManage={canManage}
            />
          ))}
        </div>
      )}
    </div>
  );
}
