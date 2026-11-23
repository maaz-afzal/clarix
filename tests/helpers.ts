import type mongoose from "mongoose";
import { vi } from "vitest";
import connectDB from "@/lib/db";
import { auth } from "@/lib/auth";
import User from "@/models/User";
import Workspace from "@/models/Workspace";
import WorkspaceMember from "@/models/WorkspaceMember";
import Project from "@/models/Project";
import Task from "@/models/Task";
import Comment from "@/models/Comment";
import Activity from "@/models/Activity";
import Attachment from "@/models/Attachment";
import Notification from "@/models/Notification";
import Invitation from "@/models/Invitation";

type Id = mongoose.Types.ObjectId;
type WithId = { _id: Id };

export async function resetDb() {
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    Workspace.deleteMany({}),
    WorkspaceMember.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    Comment.deleteMany({}),
    Activity.deleteMany({}),
    Attachment.deleteMany({}),
    Notification.deleteMany({}),
    Invitation.deleteMany({}),
  ]);
}

// Test ke liye "logged in user" tay karo (null = logout)
export function actAs(user: { _id: Id; name: string; email: string } | null) {
  vi.mocked(auth).mockResolvedValue(
    (user
      ? {
          user: { id: user._id.toString(), name: user.name, email: user.email },
          expires: "2099-01-01",
        }
      : null) as never,
  );
}

export async function makeUser(name: string) {
  return User.create({ name, email: `${name.toLowerCase()}@test.dev` });
}

export async function makeWorkspace(slug: string, owner: WithId) {
  const workspace = await Workspace.create({
    name: slug,
    slug,
    ownerId: owner._id,
  });
  await WorkspaceMember.create({
    workspaceId: workspace._id,
    userId: owner._id,
    role: "owner",
  });
  return workspace;
}

export async function addMember(
  workspace: WithId,
  user: WithId,
  role: "admin" | "member",
) {
  await WorkspaceMember.create({
    workspaceId: workspace._id,
    userId: user._id,
    role,
  });
}

export async function makeProject(workspace: WithId, creator: WithId, name = "Project") {
  return Project.create({
    workspaceId: workspace._id,
    name,
    createdBy: creator._id,
  });
}

export async function makeTask(
  project: { _id: Id; workspaceId: Id },
  creator: WithId,
  extra: { title?: string; status?: "todo" | "in-progress" | "in-review" | "done"; assigneeId?: Id } = {},
) {
  return Task.create({
    projectId: project._id,
    workspaceId: project.workspaceId,
    title: "Task",
    createdBy: creator._id,
    position: 1000,
    ...extra,
  });
}

export {
  Task,
  Comment,
  Activity,
  Attachment,
  Project,
};