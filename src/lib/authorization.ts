import { auth } from "@/lib/auth";
import { getWorkspaceMembership } from "@/lib/dal/workspace";
import Task from "@/models/Task";
import { redirect } from "next/navigation";
import connectDB from "@/lib/db";
import { cache } from "react";
import mongoose from "mongoose";
import { hasPermission, canModifyTask } from "@/lib/permissions";
import type { MemberRole, Permission } from "@/lib/permissions";

export { hasPermission, canModifyTask };
export type { MemberRole, Permission };

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

  return { task, userId, role };
}