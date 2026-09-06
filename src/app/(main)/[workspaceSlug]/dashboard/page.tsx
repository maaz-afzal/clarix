import { getDashboardStats } from "@/lib/dal/dashboard"
import { getWorkspaceBySlug } from "@/lib/dal/workspace"
import { notFound } from "next/navigation"
import {
  FolderKanban,
  CheckSquare,
  AlertCircle,
  TrendingUp,
} from "lucide-react"

type Props = {
  params: Promise<{ workspaceSlug: string }>
}

interface StatCardProps {
  label: string
  value: number
  icon: React.ElementType
  description: string
  highlight?: boolean
}

function StatCard({
  label,
  value,
  icon: Icon,
  description,
  highlight,
}: StatCardProps) {
  return (
    <div
      className={`rounded-lg border p-5 bg-card ${
        highlight ? "border-destructive/50" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <Icon
          className={`w-4 h-4 ${
            highlight ? "text-destructive" : "text-muted-foreground"
          }`}
        />
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </div>
  )
}

export default async function DashboardPage({ params }: Props) {
  const { workspaceSlug } = await params

  const workspace = await getWorkspaceBySlug(workspaceSlug)

  if (!workspace) {
    notFound()
  }

  const stats = await getDashboardStats(workspace._id)

  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {workspace.name} workspace overview
        </p>
      </div>

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
          description="Past due date"
          highlight={stats.overdueTasks > 0}
        />
      </div>

      {stats.totalProjects === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="font-medium">No projects yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Create your first project from the Projects page
          </p>
        </div>
      )}
    </div>
  )
}