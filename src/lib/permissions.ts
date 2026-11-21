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

export function hasPermission(role: MemberRole, permission: Permission): boolean {
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