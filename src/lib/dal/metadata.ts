import { auth } from "@/lib/auth";
import { getWorkspaceMembership } from "@/lib/dal/workspace";
import {
  findProjectInWorkspace,
  findTaskInWorkspace,
} from "@/lib/resource-access";

export async function getAuthorizedProjectName(
  workspaceSlug: string,
  projectId: string,
): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await getWorkspaceMembership(workspaceSlug, session.user.id);
  if (!membership) return null;

  const project = await findProjectInWorkspace(projectId, membership.workspaceId);
  return project?.name ?? null;
}

export async function getAuthorizedTaskTitle(
  workspaceSlug: string,
  taskId: string,
): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const membership = await getWorkspaceMembership(workspaceSlug, session.user.id);
  if (!membership) return null;

  const task = await findTaskInWorkspace(taskId, membership.workspaceId);
  return task?.title ?? null;
}