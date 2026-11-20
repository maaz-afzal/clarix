import { auth } from "@/lib/auth";
import { getWorkspaceMembership } from "@/lib/dal/workspace";
import Task from "@/models/Task";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import { cache } from "react";
import mongoose from "mongoose";

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

interface TaskOwnership {
  createdBy: { toString(): string };
  assigneeId?: { toString(): string } | null;
}

export function canModifyTask(
  task: TaskOwnership,
  userId: string,
  role: MemberRole,
): boolean {
  if (hasPermission(role, "task_update_any")) return true;
  if (task.createdBy.toString() === userId) return true;
  return task.assigneeId?.toString() === userId;
}

export const requireAuth = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user;
});

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

  if (!mongoose.isValidObjectId(taskId)) {
    throw new Error("NOT_FOUND");
  }

  const task = await Task.findById(taskId);

  if (!task || task.workspaceId.toString() !== membership.workspaceId) {
    throw new Error("NOT_FOUND");
  }

  const role = membership.role as MemberRole;

  if (action === "delete" && !hasPermission(role, "task_delete")) {
    throw new Error("FORBIDDEN");
  }

  if (action === "update" && !canModifyTask(task, userId, role)) {
    throw new Error("FORBIDDEN");
  }

  return task;
}
