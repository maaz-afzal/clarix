import { requireWorkspaceMember, hasPermission } from "@/lib/authorization";
import { getProjectById } from "@/lib/dal/project";
import { getTasksByProject } from "@/lib/dal/task";
import { getWorkspaceMembers } from "@/lib/dal/members";
import { notFound } from "next/navigation";
import TaskListView from "@/components/tasks/task-list-view";
import type { MemberRole } from "@/lib/authorization";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Task List" };

type Props = {
  params: Promise<{ workspaceSlug: string; projectId: string }>;
  searchParams: Promise<{
    status?: string;
    priority?: string;
    assignee?: string;
  }>;
};

export default async function ListPage({ params, searchParams }: Props) {
  const { workspaceSlug, projectId } = await params;
  const filters = await searchParams;

  const { user, membership } = await requireWorkspaceMember(workspaceSlug);
  const project = await getProjectById(projectId);

  if (!project || project.workspaceId !== membership.workspaceId) {
    notFound();
  }

  const [tasks, members] = await Promise.all([
    getTasksByProject(projectId, {
      status: filters.status,
      priority: filters.priority,
      assigneeId: filters.assignee,
    }),
    getWorkspaceMembers(membership.workspaceId),
  ]);

  const canManage = hasPermission(membership.role as MemberRole, "task_create");

  return (
    <TaskListView
      tasks={tasks}
      members={members}
      workspaceSlug={workspaceSlug}
      projectId={projectId}
      currentUserId={user.id}
      canManage={canManage}
    />
  );
}
