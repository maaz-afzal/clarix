import Link from "next/link";
import { CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/lib/dal/search";

const PRIORITY_COLORS: Record<string, string> = {
  low: "text-slate-500",
  medium: "text-blue-500",
  high: "text-orange-500",
  urgent: "text-red-500",
};

const STATUS_COLORS: Record<string, string> = {
  todo: "bg-slate-100 text-slate-700",
  "in-progress": "bg-blue-100 text-blue-700",
  "in-review": "bg-purple-100 text-purple-700",
  done: "bg-green-100 text-green-700",
};

interface SearchResultsProps {
  results: SearchResult;
  query: string;
  workspaceSlug: string;
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;

  const regex = new RegExp(`(${query.trim()})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className="bg-yellow-100 text-yellow-900 rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

export default function SearchResults({
  results,
  query,
  workspaceSlug,
}: SearchResultsProps) {
  if (results.totalCount === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-medium">No results found</p>
        <p className="text-sm text-muted-foreground mt-1">
          Nothing found for &ldquo;{query}&rdquo;
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {results.totalCount} result{results.totalCount !== 1 ? "s" : ""} Found
      </p>

      {/* Tasks */}
      {results.tasks.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Tasks ({results.tasks.length})
          </h2>
          <div className="space-y-2">
            {results.tasks.map((task) => (
              <Link
                key={task._id}
                href={`/${workspaceSlug}/projects/${task.projectId}/tasks/${task._id}`}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent transition-colors group"
              >
                <CheckSquare className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:underline">
                    <Highlight text={task.title} query={query} />
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {task.projectName}
                    </span>
                    <span
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full font-medium",
                        STATUS_COLORS[task.status],
                      )}
                    >
                      {task.status.replace("-", " ")}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        PRIORITY_COLORS[task.priority],
                      )}
                    >
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      <Highlight text={task.description} query={query} />
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {results.projects.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Projects ({results.projects.length})
          </h2>
          <div className="space-y-2">
            {results.projects.map((project) => (
              <Link
                key={project._id}
                href={`/${workspaceSlug}/projects/${project._id}`}
                className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent transition-colors group"
              >
                <div
                  className="w-4 h-4 rounded shrink-0 mt-0.5"
                  style={{ backgroundColor: project.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium group-hover:underline">
                    <Highlight text={project.name} query={query} />
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {project.taskCount} tasks
                    </span>
                    <span
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full font-medium",
                        project.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {project.status}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      <Highlight text={project.description} query={query} />
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
