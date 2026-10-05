import { requireWorkspaceMember } from "@/lib/authorization";
import { getTaskById } from "@/lib/dal/task";
import { getTaskComments, getTaskActivity } from "@/lib/dal/comments";
import { getWorkspaceMembers } from "@/lib/dal/members";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CommentSection from "@/components/tasks/comment-section";
import ActivityLog from "@/components/tasks/activity-log";
import TaskEditSidebar from "@/components/tasks/task-edit-sidebar";
import TaskTitleEditor from "@/components/tasks/task-title-editor"; 
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

  const [comments, activities, members] = await Promise.all([
    getTaskComments(taskId),
    getTaskActivity(taskId),
    getWorkspaceMembers(membership.workspaceId),
  ]);

  return (
    <div className="flex flex-col h-full">
      {/* Back navigation */}
      <div className="border-b px-6 py-3">
        <Link
          href={`/${workspaceSlug}/projects/${projectId}/list`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to List
        </Link>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-3">
            <TaskTitleEditor task={task} workspaceSlug={workspaceSlug} />
          </div>

          {/* Comments */}
          <div className="border-t pt-6">
            <CommentSection
              comments={comments}
              workspaceSlug={workspaceSlug}
              taskId={taskId}
              projectId={projectId}
              currentUserId={user.id}
              currentUserName={user.name ?? "User"}
              currentUserImage={user.image ?? undefined}
              currentUserRole={membership.role}
            />
          </div>

          {/* Activity */}
          {activities.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold mb-4">Activity</h3>
              <ActivityLog activities={activities} />
            </div>
          )}
        </div>

        {/* Right - Edit sidebar */}
        <div className="w-64 border-l p-4 overflow-y-auto shrink-0">
          <h3 className="text-sm font-semibold mb-4">Details</h3>
          <TaskEditSidebar
            task={task}
            members={members}
            workspaceSlug={workspaceSlug}
          />
        </div>
      </div>
    </div>
  );
}
