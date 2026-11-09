import { BarChart3 } from "lucide-react";
import { requireWorkspaceMember } from "@/lib/authorization";
import { getProjectById } from "@/lib/dal/project";
import { getProjectAnalytics } from "@/lib/dal/analytics";
import { notFound } from "next/navigation";
import ProjectSummary from "@/components/ai/project-summary";
import AnalyticsCharts from "@/components/analytics/analytics-charts";
import EmptyState from "@/components/shared/empty-state";
import type { Metadata } from "next";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params;
  const project = await getProjectById(projectId);
  return { title: project ? `Analytics | ${project.name}` : "Analytics" };
}

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

  const analytics = await getProjectAnalytics(projectId, membership.workspaceId);
  const { total, overdue, byStatus, byPriority, trend, assigneeWorkload } = analytics;

  const completionRate =
    total > 0 ? Math.round((byStatus.done / total) * 100) : 0;

  const summaryStats = {
    total,
    todo: byStatus.todo,
    inProgress: byStatus["in-progress"],
    inReview: byStatus["in-review"],
    done: byStatus.done,
    overdue,
  };

  const statCards = [
    { label: "Total Tasks", value: total, color: "text-foreground" },
    { label: "Completed", value: byStatus.done, color: "text-green-600" },
    { label: "In Progress", value: byStatus["in-progress"], color: "text-blue-600" },
    { label: "Overdue", value: overdue, color: "text-destructive" },
  ];

  return (
    <div className="max-w-4xl space-y-6 p-6">
      <ProjectSummary
        workspaceSlug={workspaceSlug}
        projectName={project.name}
        stats={summaryStats}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="rounded-lg border bg-card p-4">
            <p className="mb-1 text-xs text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {total === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No data yet"
          description="Add tasks to this project to see charts here."
        />
      ) : (
        <>
          <div className="space-y-3 rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Overall progress</h3>
              <span className="text-sm font-bold">{completionRate}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={completionRate}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall project completion"
              className="h-3 overflow-hidden rounded-full bg-muted"
            >
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          <AnalyticsCharts
            byStatus={byStatus}
            byPriority={byPriority}
            trend={trend}
            assigneeWorkload={assigneeWorkload}
          />
        </>
      )}
    </div>
  );
}