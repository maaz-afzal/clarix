import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { requireWorkspaceMember } from "@/lib/authorization";
import { getTaskById } from "@/lib/dal/task";
import { Skeleton } from "@/components/ui/skeleton";
import TaskTitleEditor from "@/components/tasks/task-title-editor";
import {
  TaskComments,
  TaskActivity,
  TaskSidebarPanels,
} from "@/components/tasks/task-detail-sections";

interface TaskDetailViewProps {
  workspaceSlug: string;
  projectId: string;
  taskId: string;
  variant: "page" | "modal";
}

export default async function TaskDetailView({
  workspaceSlug,
  projectId,
  taskId,
  variant,
}: TaskDetailViewProps) {
  const { user, membership } = await requireWorkspaceMember(workspaceSlug);

  const task = await getTaskById(taskId);

  if (
    !task ||
    task.workspaceId !== membership.workspaceId ||
    task.projectId !== projectId
  ) {
    notFound();
  }

  const currentUser = {
    id: user.id,
    name: user.name ?? "User",
    image: user.image ?? undefined,
  };

  const isPage = variant === "page";

  return (
    <div className={cn("flex flex-col", isPage && "h-full")}>
      {isPage && (
        <div className="border-b px-6 py-3">
          <Link
            href={`/${workspaceSlug}/projects/${projectId}/list`}
            className="flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to List
          </Link>
        </div>
      )}

      <div
        className={cn(
          "flex flex-col lg:flex-row",
          isPage && "flex-1 overflow-y-auto lg:overflow-hidden",
        )}
      >
        <div
          className={cn("flex-1 space-y-6 p-6", isPage && "lg:overflow-y-auto")}
        >
          <div className="space-y-3">
            <TaskTitleEditor task={task} workspaceSlug={workspaceSlug} />
          </div>

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

          <Suspense fallback={<SectionSkeleton rows={2} />}>
            <TaskActivity task={task} />
          </Suspense>
        </div>

        <aside
          aria-label="Task details"
          className={cn(
            "w-full shrink-0 border-t p-4 lg:w-64 lg:border-l lg:border-t-0",
            isPage && "lg:overflow-y-auto",
          )}
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
