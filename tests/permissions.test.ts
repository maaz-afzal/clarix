import { describe, expect, it } from "vitest";
import { canModifyTask, hasPermission } from "@/lib/permissions";

const task = { createdBy: "creator", assigneeId: "assignee" };

describe("canModifyTask", () => {
  it.each([
    ["owner", "someone-else", true],
    ["admin", "someone-else", true],
    ["member", "creator", true],
    ["member", "assignee", true],
    ["member", "someone-else", false],
  ] as const)("role %s, user %s -> %s", (role, userId, expected) => {
    expect(canModifyTask(task, userId, role)).toBe(expected);
  });

  it("an unassigned task is not modifiable by an unrelated member", () => {
    expect(
      canModifyTask({ createdBy: "creator", assigneeId: null }, "x", "member"),
    ).toBe(false);
  });
});

describe("hasPermission", () => {
  it("only owner can delete a workspace", () => {
    expect(hasPermission("owner", "workspace_delete")).toBe(true);
    expect(hasPermission("admin", "workspace_delete")).toBe(false);
    expect(hasPermission("member", "workspace_delete")).toBe(false);
  });

  it("members cannot assign tasks to others", () => {
    expect(hasPermission("member", "task_assign")).toBe(false);
    expect(hasPermission("admin", "task_assign")).toBe(true);
  });
});