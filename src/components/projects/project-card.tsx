import Link from "next/link";
import { FolderKanban } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import ProjectCardActions from "./project-card-actions";

interface ProjectCardProps {
  project: {
    _id: string;
    name: string;
    description?: string;
    color: string;
    status: string;
    createdAt: string;
    taskCount: number;
    completedCount: number;
  };
  workspaceSlug: string;
  canManage: boolean;
}

export default function ProjectCard({
  project,
  workspaceSlug,
  canManage,
}: ProjectCardProps) {
  const isArchived = project.status === "archived";

  return (
    <div
      className={cn(
        "group relative rounded-lg border bg-card p-4 transition-colors hover:border-primary/40",
        isArchived && "opacity-60",
      )}
    >
      <div className="mb-3 flex items-start justify-between">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: project.color + "20" }}
        >
          <FolderKanban className="h-4 w-4" style={{ color: project.color }} aria-hidden="true" />
        </div>

        {canManage && (
          <ProjectCardActions workspaceSlug={workspaceSlug} project={project} />
        )}
      </div>

      <Link href={`/${workspaceSlug}/projects/${project._id}`} className="block">
        <h3 className="mb-1 line-clamp-1 text-sm font-semibold hover:underline">
          {project.name}
        </h3>
        {project.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{project.description}</p>
        )}
      </Link>

      <div className="mt-3 flex items-center justify-between border-t pt-3">
        <span className="text-xs text-muted-foreground">{formatDate(project.createdAt)}</span>
        <div className="flex items-center gap-2">
          {isArchived && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              Archived
            </span>
          )}
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ backgroundColor: project.color + "20", color: project.color }}
          >
            {project.completedCount}/{project.taskCount}
          </span>
        </div>
      </div>
    </div>
  );
}