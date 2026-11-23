import mongoose from "mongoose";
import { beforeEach, describe, expect, it } from "vitest";
import { addComment, deleteComment } from "@/actions/comment";
import {
  createTask,
  deleteTask,
  updateTask,
  updateTaskPositions,
} from "@/actions/task";
import { deleteFile } from "@/lib/cloudinary";
import {
  actAs,
  Activity,
  addMember,
  Attachment,
  Comment,
  makeProject,
  makeTask,
  makeUser,
  makeWorkspace,
  Project,
  resetDb,
  Task,
} from "./helpers";

// Workspace A: alice (owner), amy (member). Workspace B: bob (owner).
async function seed() {
  const alice = await makeUser("Alice");
  const amy = await makeUser("Amy");
  const bob = await makeUser("Bob");

  const wsA = await makeWorkspace("ws-a", alice);
  await addMember(wsA, amy, "member");
  const wsB = await makeWorkspace("ws-b", bob);

  const projectA = await makeProject(wsA, alice, "Project A");
  const projectB = await makeProject(wsB, bob, "Project B");

  const taskA = await makeTask(projectA, alice, { title: "Task A" });
  const taskB = await makeTask(projectB, bob, { title: "Task B" });
  const commentB = await Comment.create({
    taskId: taskB._id,
    userId: bob._id,
    content: "private to B",
  });

  return { alice, amy, bob, wsA, wsB, projectA, projectB, taskA, taskB, commentB };
}

let s: Awaited<ReturnType<typeof seed>>;

beforeEach(async () => {
  await resetDb();
  s = await seed();
  actAs(null);
});

describe("comments stay inside their workspace", () => {
  it("cannot comment on another workspace's task", async () => {
    actAs(s.alice);
    const result = await addComment("ws-a", s.taskB._id.toString(), {
      content: "intrusion",
    });

    expect(result).toEqual({ success: false, error: "Resource not found" });
    expect(await Comment.countDocuments({ taskId: s.taskB._id })).toBe(1);
  });

  it("an owner cannot delete a comment from another workspace", async () => {
    actAs(s.alice);
    const result = await deleteComment("ws-a", s.commentB._id.toString());

    expect(result).toEqual({ success: false, error: "Resource not found" });
    expect(await Comment.exists({ _id: s.commentB._id })).not.toBeNull();
  });

  it("an owner can delete a member's comment in their own workspace", async () => {
    const comment = await Comment.create({
      taskId: s.taskA._id,
      userId: s.amy._id,
      content: "mine",
    });

    actAs(s.alice);
    const result = await deleteComment("ws-a", comment._id.toString());

    expect(result.success).toBe(true);
    expect(await Comment.exists({ _id: comment._id })).toBeNull();
  });
});

describe("createTask validates its project and assignee", () => {
  it("rejects a project from another workspace", async () => {
    actAs(s.alice);
    const result = await createTask("ws-a", s.projectB._id.toString(), {
      title: "injected",
    });

    expect(result).toEqual({ success: false, error: "Resource not found" });
    expect(await Task.countDocuments({ projectId: s.projectB._id })).toBe(1);
  });

  it.each([new mongoose.Types.ObjectId().toString(), "abc", ""])(
    "rejects missing or malformed project id %j",
    async (projectId) => {
      actAs(s.alice);
      const result = await createTask("ws-a", projectId, { title: "x" });
      expect(result).toEqual({ success: false, error: "Resource not found" });
    },
  );

  it("rejects an archived project", async () => {
    await Project.findByIdAndUpdate(s.projectA._id, { status: "archived" });
    actAs(s.alice);
    const result = await createTask("ws-a", s.projectA._id.toString(), {
      title: "x",
    });
    expect(result).toEqual({ success: false, error: "This project is archived" });
  });

  it("a member can assign only themselves", async () => {
    actAs(s.amy);

    const other = await createTask("ws-a", s.projectA._id.toString(), {
      title: "to alice",
      assigneeId: s.alice._id.toString(),
    });
    expect(other).toEqual({ success: false, error: "You do not have permission to do this" });

    const self = await createTask("ws-a", s.projectA._id.toString(), {
      title: "to me",
      assigneeId: s.amy._id.toString(),
    });
    expect(self.success).toBe(true);
  });

  it("an owner cannot assign someone outside the workspace", async () => {
    actAs(s.alice);
    const result = await createTask("ws-a", s.projectA._id.toString(), {
      title: "x",
      assigneeId: s.bob._id.toString(),
    });
    expect(result).toEqual({
      success: false,
      error: "Assignee must be a member of this workspace",
    });
  });

  it("an owner can assign a workspace member", async () => {
    actAs(s.alice);
    const result = await createTask("ws-a", s.projectA._id.toString(), {
      title: "x",
      assigneeId: s.amy._id.toString(),
    });
    expect(result.success).toBe(true);
  });
});

describe("updateTask", () => {
  it("a member who is neither creator nor assignee is forbidden", async () => {
    actAs(s.amy);
    const result = await updateTask("ws-a", s.taskA._id.toString(), {
      status: "done",
    });

    expect(result).toEqual({ success: false, error: "You do not have permission to do this" });
    expect((await Task.findById(s.taskA._id))?.status).toBe("todo");
  });

  it("an assignee can change the status", async () => {
    await Task.findByIdAndUpdate(s.taskA._id, { assigneeId: s.amy._id });
    actAs(s.amy);

    const result = await updateTask("ws-a", s.taskA._id.toString(), {
      status: "done",
    });

    expect(result.success).toBe(true);
    expect((await Task.findById(s.taskA._id))?.status).toBe("done");
  });

  it("cannot touch a task in another workspace", async () => {
    actAs(s.alice);
    const result = await updateTask("ws-a", s.taskB._id.toString(), {
      title: "hijacked",
    });
    expect(result).toEqual({ success: false, error: "Resource not found" });
    expect((await Task.findById(s.taskB._id))?.title).toBe("Task B");
  });

  it("an empty assigneeId unassigns the task", async () => {
    await Task.findByIdAndUpdate(s.taskA._id, { assigneeId: s.amy._id });
    actAs(s.alice);

    const result = await updateTask("ws-a", s.taskA._id.toString(), {
      assigneeId: "",
    });

    expect(result.success).toBe(true);
    expect((await Task.findById(s.taskA._id))?.assigneeId ?? null).toBeNull();
  });
});

describe("updateTaskPositions applies the same status rule", () => {
  it("rejects a status change on someone else's task", async () => {
    actAs(s.amy);
    const result = await updateTaskPositions("ws-a", [
      { taskId: s.taskA._id.toString(), position: 42, status: "done" },
    ]);

    expect(result).toEqual({ success: false, error: "You do not have permission to do this" });
    const task = await Task.findById(s.taskA._id);
    expect(task?.status).toBe("todo");
    expect(task?.position).toBe(1000);
  });

  it("allows reordering inside the same column", async () => {
    actAs(s.amy);
    const result = await updateTaskPositions("ws-a", [
      { taskId: s.taskA._id.toString(), position: 5, status: "todo" },
    ]);

    expect(result.success).toBe(true);
    expect((await Task.findById(s.taskA._id))?.position).toBe(5);
  });
});

describe("deleteTask", () => {
  it("removes related comments, activity and attachments", async () => {
    await Comment.create({ taskId: s.taskA._id, userId: s.amy._id, content: "c" });
    await Activity.create({
      workspaceId: s.wsA._id,
      projectId: s.projectA._id,
      taskId: s.taskA._id,
      userId: s.alice._id,
      action: "task_created",
    });
    await Attachment.create({
      taskId: s.taskA._id,
      workspaceId: s.wsA._id,
      uploadedBy: s.alice._id,
      url: "https://example.test/a.png",
      publicId: "pub-1",
      fileName: "a.png",
      fileSize: 10,
      format: "png",
    });

    actAs(s.alice);
    const result = await deleteTask("ws-a", s.taskA._id.toString());

    expect(result.success).toBe(true);
    expect(await Task.exists({ _id: s.taskA._id })).toBeNull();
    expect(await Comment.countDocuments({ taskId: s.taskA._id })).toBe(0);
    expect(await Activity.countDocuments({ taskId: s.taskA._id })).toBe(0);
    expect(await Attachment.countDocuments({ taskId: s.taskA._id })).toBe(0);
    expect(deleteFile).toHaveBeenCalled();
    // doosre workspace ka data wahi
    expect(await Comment.exists({ _id: s.commentB._id })).not.toBeNull();
  });

  it("a plain member cannot delete", async () => {
    actAs(s.amy);
    const result = await deleteTask("ws-a", s.taskA._id.toString());
    expect(result).toEqual({ success: false, error: "You do not have permission to do this" });
    expect(await Task.exists({ _id: s.taskA._id })).not.toBeNull();
  });

  it("cannot delete a task in another workspace", async () => {
    actAs(s.alice);
    const result = await deleteTask("ws-a", s.taskB._id.toString());
    expect(result).toEqual({ success: false, error: "Resource not found" });
    expect(await Task.exists({ _id: s.taskB._id })).not.toBeNull();
  });
});