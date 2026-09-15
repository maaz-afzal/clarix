import { requireWorkspaceMember } from "@/lib/authorization";
import { getProjectsByWorkspace } from "@/lib/dal/project";
import ProjectCard from "@/components/projects/project-card";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";

type Props = {
  params: Promise<{ workspaceSlug: string }>;
};

export default async function ProjectsPage({ params }: Props) {
  const { workspaceSlug } = await params;

  const { membership } = await requireWorkspaceMember(workspaceSlug);

  const projects = await getProjectsByWorkspace(membership.workspaceId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>

        {["owner", "admin"].includes(membership.role) && (
          <button className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium">Koi project nahi hai</p>
          <p className="text-sm text-muted-foreground mt-1">
            {["owner", "admin"].includes(membership.role)
              ? "Apna pehla project banao"
              : "Abhi koi project nahi hai is workspace mein"}
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
