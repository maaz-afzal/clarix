export type UserRole = "owner" | "admin" | "member";

export type TaskStatus = "todo" | "in-progress" | "in-review" | "done";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type WorkspaceRole = "owner" | "admin" | "member";

export interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
}

export interface Workspace {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
}

export interface WorkspaceMember {
  _id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  user?: User;
}

export interface Project {
  _id: string;
  workspaceId: string;
  name: string;
  description?: string;
  color: string;
  status: "active" | "archived";
  createdBy: string;
}

export interface Task {
  _id: string;
  projectId: string;
  workspaceId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  createdBy: string;
  dueDate?: string;
  position: number;
  assignee?: User;
}
