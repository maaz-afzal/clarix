import {
  FolderKanban,
  CheckSquare,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import type { DashboardStats } from "@/lib/dal/dashboard";

interface StatsCardsProps {
  stats: DashboardStats;
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  description: string;
  variant?: "default" | "danger";
}

function StatCard({
  label,
  value,
  icon: Icon,
  description,
  variant = "default",
}: StatCardProps) {
  return (
    <div
      className={`rounded-lg border p-5 bg-card ${
        variant === "danger" && value > 0 ? "border-destructive/40" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Icon
          className={`w-4 h-4 ${
            variant === "danger" && value > 0
              ? "text-destructive"
              : "text-muted-foreground"
          }`}
        />
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Projects"
        value={stats.totalProjects}
        icon={FolderKanban}
        description="Active projects"
      />
      <StatCard
        label="Total Tasks"
        value={stats.totalTasks}
        icon={CheckSquare}
        description="Across all projects"
      />
      <StatCard
        label="Completed"
        value={stats.completedTasks}
        icon={TrendingUp}
        description={`${completionRate}% completion rate`}
      />
      <StatCard
        label="Overdue"
        value={stats.overdueTasks}
        icon={AlertCircle}
        description="Needs attention"
        variant="danger"
      />
    </div>
  );
}
