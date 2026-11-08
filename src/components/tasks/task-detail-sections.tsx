import { getTaskComments, getTaskActivity } from "@/lib/dal/comments";
import { getWorkspaceMembers } from "@/lib/dal/members";
import { getProjectById } from "@/lib/dal/project";
import { getTaskAttachments } from "@/lib/dal/attachments";
import type { TaskItem } from "@/lib/dal/task";
import CommentSection from "./comment-section";
import ActivityLog from "./activity-log";
import TaskEditSidebar from "./task-edit-sidebar";
import AttachmentsSection from "./attachments-section";
import AIBreakdownPanel from "@/components/ai/ai-breakdown-panel";

interface CommonProps {
  task: TaskItem;
  workspaceSlug: string;
  projectId: string;
}

export async function TaskComments({
  task,
  workspaceSlug,
  projectId,
  user,
  role,
}: CommonProps & {
  user: { id: string; name: string; image?: string };
  role: string;
}) {
  const comments = await getTaskComments(task._id);

  return (
    <CommentSection
      comments={comments}
      workspaceSlug={workspaceSlug}
      taskId={task._id}
      projectId={projectId}
      currentUserId={user.id}
      currentUserName={user.name}
      currentUserImage={user.image}
      currentUserRole={role}
    />
  );
}

export async function TaskActivity({ task }: { task: TaskItem }) {
  const activities = await getTaskActivity(task._id);
  if (activities.length === 0) return null;

  return (
    <div className="border-t pt-6">
      <h3 className="mb-4 text-sm font-semibold">Activity</h3>
      <ActivityLog activities={activities} />
    </div>
  );
}

export async function TaskSidebarPanels({
  task,
  workspaceSlug,
  projectId,
  workspaceId,
  user,
  role,
}: CommonProps & {
  workspaceId: string;
  user: { id: string };
  role: string;
}) {
  const [members, project, attachments] = await Promise.all([
    getWorkspaceMembers(workspaceId),
    getProjectById(projectId),
    getTaskAttachments(task._id),
  ]);

  return (
    <>
      <TaskEditSidebar task={task} members={members} workspaceSlug={workspaceSlug} />
      <div className="mt-4 border-t pt-4">
        <AIBreakdownPanel task={task} workspaceSlug={workspaceSlug} projectName={project?.name} />
      </div>
      <div className="mt-4 border-t pt-4">
        <AttachmentsSection
          initialAttachments={attachments}
          workspaceSlug={workspaceSlug}
          taskId={task._id}
          projectId={projectId}
          currentUserId={user.id}
          currentUserRole={role}
        />
      </div>
    </>
  );
}