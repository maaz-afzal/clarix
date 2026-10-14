import Link from "next/link";
import type { ProjectProgress } from "@/lib/dal/dashboard";

interface ProjectProgressProps {
  projects: ProjectProgress[];
  workspaceSlug: string;
}

export default function ProjectProgressList({
  projects,
  workspaceSlug,
}: ProjectProgressProps) {
  if (projects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        No active projects
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Link
          key={project._id}
          href={`/${workspaceSlug}/projects/${project._id}`}
          className="block group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <span className="text-sm font-medium truncate group-hover:underline">
                {project.name}
              </span>
            </div>
            <span className="text-xs text-muted-foreground shrink-0 ml-2">
              {project.completed}/{project.total}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${project.percentage}%`,
                backgroundColor: project.color,
              }}
            />
          </div>

          <p className="text-xs text-muted-foreground mt-1">
            {project.percentage}% complete
          </p>
        </Link>
      ))}
    </div>
  );
}
