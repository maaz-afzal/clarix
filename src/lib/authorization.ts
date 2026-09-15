import { auth } from "@/lib/auth";
import { getWorkspaceMembership } from "@/lib/dal/workspace";
import Task from "@/models/Task";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";

export type MemberRole = "owner" | "admin" | "member";

const PERMISSIONS = {
  workspace_delete: ["owner"],
  workspace_update: ["owner", "admin"],
  member_invite: ["owner", "admin"],
  member_remove: ["owner", "admin"],
  member_role_change: ["owner"],
  project_create: ["owner", "admin"],
  project_update: ["owner", "admin"],
  project_delete: ["owner", "admin"],
  project_view: ["owner", "admin", "member"],
  task_create: ["owner", "admin", "member"],
  task_update_own: ["owner", "admin", "member"],
  task_update_any: ["owner", "admin"],
  task_delete: ["owner", "admin"],
  task_assign: ["owner", "admin"],
  comment_create: ["owner", "admin", "member"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(
  role: MemberRole,
  permission: Permission,
): boolean {
  return (PERMISSIONS[permission] as readonly string[]).includes(role);
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user;
}

export async function requireWorkspaceMember(workspaceSlug: string) {
  const user = await requireAuth();

  const membership = await getWorkspaceMembership(workspaceSlug, user.id);

  if (!membership) {
    redirect("/unauthorized");
  }

  return { user, membership };
}

export async function requireWorkspaceAdmin(workspaceSlug: string) {
  const { user, membership } = await requireWorkspaceMember(workspaceSlug);

  if (!hasPermission(membership.role as MemberRole, "workspace_update")) {
    redirect("/unauthorized");
  }

  return { user, membership };
}

export async function verifyWorkspaceMember(workspaceSlug: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("UNAUTHENTICATED");
  }

  const membership = await getWorkspaceMembership(
    workspaceSlug,
    session.user.id,
  );

  if (!membership) {
    throw new Error("UNAUTHORIZED");
  }

  return { userId: session.user.id, membership };
}

export async function verifyPermission(
  workspaceSlug: string,
  permission: Permission,
) {
  const { userId, membership } = await verifyWorkspaceMember(workspaceSlug);

  if (!hasPermission(membership.role as MemberRole, permission)) {
    throw new Error("FORBIDDEN");
  }

  return { userId, membership };
}

export async function verifyTaskAccess(
  taskId: string,
  workspaceSlug: string,
  action: "update" | "delete",
) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("UNAUTHENTICATED");
  }

  const userId = session.user.id;

  const membership = await getWorkspaceMembership(workspaceSlug, userId);

  if (!membership) {
    throw new Error("UNAUTHORIZED");
  }

  await connectDB();

  const task = await Task.findById(taskId);

  if (!task) {
    throw new Error("Task not found");
  }

  if (task.workspaceId.toString() !== membership.workspaceId) {
    throw new Error("Task does not belong to this workspace");
  }

  if (action === "delete") {
    if (!hasPermission(membership.role as MemberRole, "task_delete")) {
      throw new Error("FORBIDDEN");
    }
  }

  if (action === "update") {
    const isTaskCreator = task.createdBy.toString() === userId;

    if (isTaskCreator) {
      return task;
    }

    if (!hasPermission(membership.role as MemberRole, "task_update_any")) {
      throw new Error("FORBIDDEN");
    }
  }

  return task;
}
