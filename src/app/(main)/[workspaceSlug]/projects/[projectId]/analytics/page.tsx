import { requireWorkspaceMember } from "@/lib/authorization";
import { getProjectById } from "@/lib/dal/project";
import { getTasksByProject } from "@/lib/dal/task";
import { notFound } from "next/navigation";
import ProjectSummary from "@/components/ai/project-summary";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics" };

type Props = {
  params: Promise<{ workspaceSlug: string; projectId: string }>;
};

export default async function AnalyticsPage({ params }: Props) {
  const { workspaceSlug, projectId } = await params;

  const { membership } = await requireWorkspaceMember(workspaceSlug);
  const project = await getProjectById(projectId);

  if (!project || project.workspaceId !== membership.workspaceId) {
    notFound();
  }

  const tasks = await getTasksByProject(projectId);

  const now = new Date();

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    inReview: tasks.filter((t) => t.status === "in-review").length,
    done: tasks.filter((t) => t.status === "done").length,
    overdue: tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "done",
    ).length,
  };

  const completionRate =
    stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* AI Summary */}
      <ProjectSummary
        workspaceSlug={workspaceSlug}
        projectName={project.name}
        stats={stats}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Tasks",
            value: stats.total,
            color: "text-foreground",
          },
          { label: "Completed", value: stats.done, color: "text-green-600" },
          {
            label: "In Progress",
            value: stats.inProgress,
            color: "text-blue-600",
          },
          {
            label: "In Review",
            value: stats.inReview,
            color: "text-purple-600",
          },
          { label: "Todo", value: stats.todo, color: "text-muted-foreground" },
          { label: "Overdue", value: stats.overdue, color: "text-destructive" },
        ].map((stat) => (
          <div key={stat.label} className="border rounded-lg p-4 bg-card">
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="border rounded-xl p-5 bg-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Overall Progress</h3>
          <span className="text-sm font-bold">{completionRate}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {stats.done} of {stats.total} tasks complete
        </p>
      </div>

      {/* Status breakdown */}
      {stats.total > 0 && (
        <div className="border rounded-xl p-5 bg-card space-y-3">
          <h3 className="text-sm font-semibold">Status Breakdown</h3>
          {[
            { label: "Todo", value: stats.todo, color: "bg-slate-400" },
            {
              label: "In Progress",
              value: stats.inProgress,
              color: "bg-blue-500",
            },
            {
              label: "In Review",
              value: stats.inReview,
              color: "bg-purple-500",
            },
            { label: "Done", value: stats.done, color: "bg-green-500" },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full`}
                  style={{
                    width: `${stats.total > 0 ? (item.value / stats.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
