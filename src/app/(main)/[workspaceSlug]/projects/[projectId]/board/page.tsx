import { requireWorkspaceMember, hasPermission } from "@/lib/authorization";
import { getProjectById } from "@/lib/dal/project";
import { getTasksByProject } from "@/lib/dal/task";
import { getWorkspaceMembers } from "@/lib/dal/members";
import { notFound } from "next/navigation";
import KanbanBoard from "@/components/tasks/kanban-board";
import type { MemberRole } from "@/lib/authorization";
import type { Metadata } from "next";
import { getAuthorizedProjectName } from "@/lib/dal/metadata";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { workspaceSlug, projectId } = await params;
  const name = await getAuthorizedProjectName(workspaceSlug, projectId);
  return { title: name ? `Board | ${name}` : "Board" };
}

type Props = {
  params: Promise<{ workspaceSlug: string; projectId: string }>;
};

export default async function BoardPage({ params }: Props) {
  const { workspaceSlug, projectId } = await params;

  const { user, membership } = await requireWorkspaceMember(workspaceSlug);

  const project = await getProjectById(projectId);
  if (!project || project.workspaceId !== membership.workspaceId) {
    notFound();
  }

  const [tasks, members] = await Promise.all([
    getTasksByProject(projectId),
    getWorkspaceMembers(membership.workspaceId),
  ]);

  const canManage = hasPermission(membership.role as MemberRole, "task_create");

  return (
    <KanbanBoard
      tasks={tasks}
      members={members}
      workspaceSlug={workspaceSlug}
      projectId={projectId}
      currentUserId={user.id}
      canManage={canManage}
      role={membership.role}
    />
  );
}
