import { Suspense } from "react";
import { requireWorkspaceMember } from "@/lib/authorization";
import {
  getDashboardStats,
  getProjectsProgress,
  getOverdueTasks,
  getRecentActivity,
  getMyTasks,
} from "@/lib/dal/dashboard";
import StatsCards from "@/components/dashboard/stats-cards";
import ProjectProgressList from "@/components/dashboard/project-progress";
import OverdueTasks from "@/components/dashboard/overdue-tasks";
import ActivityFeed from "@/components/dashboard/activity-feed";
import MyTasks from "@/components/dashboard/my-tasks";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

async function DashboardStats({ workspaceId }: { workspaceId: string }) {
  const stats = await getDashboardStats(workspaceId);
  return <StatsCards stats={stats} />;
}

async function DashboardProjects({
  workspaceId,
  workspaceSlug,
}: {
  workspaceId: string;
  workspaceSlug: string;
}) {
  const projects = await getProjectsProgress(workspaceId);
  return (
    <ProjectProgressList projects={projects} workspaceSlug={workspaceSlug} />
  );
}

async function DashboardOverdue({
  workspaceId,
  workspaceSlug,
}: {
  workspaceId: string;
  workspaceSlug: string;
}) {
  const tasks = await getOverdueTasks(workspaceId);
  return <OverdueTasks tasks={tasks} workspaceSlug={workspaceSlug} />;
}

async function DashboardActivity({ workspaceId }: { workspaceId: string }) {
  const activities = await getRecentActivity(workspaceId);
  return <ActivityFeed activities={activities} />;
}

async function DashboardMyTasks({
  workspaceId,
  userId,
  workspaceSlug,
}: {
  workspaceId: string;
  userId: string;
  workspaceSlug: string;
}) {
  const tasks = await getMyTasks(workspaceId, userId);
  return <MyTasks tasks={tasks} workspaceSlug={workspaceSlug} />;
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-28 bg-muted animate-pulse rounded-lg" />
      ))}
    </div>
  );
}

function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-muted animate-pulse rounded-md" />
      ))}
    </div>
  );
}

type Props = {
  params: Promise<{ workspaceSlug: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const { user, membership } = await requireWorkspaceMember(workspaceSlug);
  const { workspaceId, workspaceName } = membership;
  const userId = user.id;

  return (
    <div className="p-6 space-y-6">

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {workspaceName} workspace overview
        </p>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats workspaceId={workspaceId} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress */}
        <div className="border rounded-xl p-5 bg-card">
          <h2 className="text-sm font-semibold mb-4">Project Progress</h2>
          <Suspense fallback={<SectionSkeleton rows={4} />}>
            <DashboardProjects
              workspaceId={workspaceId}
              workspaceSlug={workspaceSlug}
            />
          </Suspense>
        </div>

        {/* Overdue Tasks */}
        <div className="border rounded-xl p-5 bg-card">
          <h2 className="text-sm font-semibold mb-4">Overdue Tasks</h2>
          <Suspense fallback={<SectionSkeleton rows={3} />}>
            <DashboardOverdue
              workspaceId={workspaceId}
              workspaceSlug={workspaceSlug}
            />
          </Suspense>
        </div>
      </div>

      {/* My Tasks */}
      <div className="border rounded-xl p-5 bg-card">
        <h2 className="text-sm font-semibold mb-4">My Tasks</h2>
        <Suspense fallback={<SectionSkeleton rows={3} />}>
          <DashboardMyTasks
            workspaceId={workspaceId}
            userId={userId}
            workspaceSlug={workspaceSlug}
          />
        </Suspense>
      </div>

      {/* Activity Feed */}
      <div className="border rounded-xl p-5 bg-card">
        <h2 className="text-sm font-semibold mb-4">Recent Activity</h2>
        <Suspense fallback={<SectionSkeleton rows={5} />}>
          <DashboardActivity workspaceId={workspaceId} />
        </Suspense>
      </div>
    </div>
  );
}
