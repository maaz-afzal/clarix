import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireWorkspaceMember } from "@/lib/authorization";
import { getTaskById } from "@/lib/dal/task";
import { Skeleton } from "@/components/ui/skeleton";
import TaskTitleEditor from "@/components/tasks/task-title-editor";
import {
  TaskComments,
  TaskActivity,
  TaskSidebarPanels,
} from "@/components/tasks/task-detail-sections";
import type { Metadata } from "next";

type Props = {
  params: Promise<{
    workspaceSlug: string;
    projectId: string;
    taskId: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { taskId } = await params;
  const task = await getTaskById(taskId);
  return { title: task?.title ?? "Task" };
}

export default async function TaskDetailPage({ params }: Props) {
  const { workspaceSlug, projectId, taskId } = await params;

  const { user, membership } = await requireWorkspaceMember(workspaceSlug);

  const task = await getTaskById(taskId);

  if (!task || task.workspaceId !== membership.workspaceId) {
    notFound();
  }

  const currentUser = {
    id: user.id,
    name: user.name ?? "User",
    image: user.image ?? undefined,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Back navigation */}
      <div className="border-b px-6 py-3">
        <Link
          href={`/${workspaceSlug}/projects/${projectId}/list`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to List
        </Link>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <div className="flex-1 space-y-6 p-6 lg:overflow-y-auto">
          <div className="space-y-3">
            <TaskTitleEditor task={task} workspaceSlug={workspaceSlug} />
          </div>

          {/* Comments */}
          <div className="border-t pt-6">
            <Suspense fallback={<SectionSkeleton rows={3} />}>
              <TaskComments
                task={task}
                workspaceSlug={workspaceSlug}
                projectId={projectId}
                user={currentUser}
                role={membership.role}
              />
            </Suspense>
          </div>

          {/* Activity */}
          <Suspense fallback={<SectionSkeleton rows={2} />}>
            <TaskActivity task={task} />
          </Suspense>
        </div>

        <aside
          aria-label="Task details"
          className="w-full shrink-0 border-t p-4 lg:w-64 lg:overflow-y-auto lg:border-l lg:border-t-0"
        >
          <h3 className="mb-4 text-sm font-semibold">Details</h3>
          <Suspense fallback={<SectionSkeleton rows={4} />}>
            <TaskSidebarPanels
              task={task}
              workspaceSlug={workspaceSlug}
              projectId={projectId}
              workspaceId={membership.workspaceId}
              user={currentUser}
              role={membership.role}
            />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}

function SectionSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}