import { beforeEach, describe, expect, it } from "vitest";
import {
  getAuthorizedProjectName,
  getAuthorizedTaskTitle,
} from "@/lib/dal/metadata";
import {
  actAs,
  addMember,
  makeProject,
  makeTask,
  makeUser,
  makeWorkspace,
  resetDb,
} from "./helpers";

let s: Awaited<ReturnType<typeof seed>>;

async function seed() {
  const alice = await makeUser("Alice");
  const bob = await makeUser("Bob");
  const amy = await makeUser("Amy");
  const wsA = await makeWorkspace("ws-a", alice);
  await addMember(wsA, amy, "member");
  const wsB = await makeWorkspace("ws-b", bob);
  const projectB = await makeProject(wsB, bob, "Secret Project B");
  const taskB = await makeTask(projectB, bob, { title: "Secret task B" });
  return { alice, bob, amy, projectB, taskB };
}

beforeEach(async () => {
  await resetDb();
  s = await seed();
  actAs(null);
});

describe("page title lookups", () => {
  it("a member of the workspace gets the real names", async () => {
    actAs(s.bob);
    expect(await getAuthorizedProjectName("ws-b", s.projectB._id.toString())).toBe(
      "Secret Project B",
    );
    expect(await getAuthorizedTaskTitle("ws-b", s.taskB._id.toString())).toBe(
      "Secret task B",
    );
  });

  it("another workspace's member gets nothing, even through their own slug", async () => {
    actAs(s.alice);
    expect(await getAuthorizedProjectName("ws-a", s.projectB._id.toString())).toBeNull();
    expect(await getAuthorizedTaskTitle("ws-a", s.taskB._id.toString())).toBeNull();
    // aur B ke slug par to membership hi nahi
    expect(await getAuthorizedProjectName("ws-b", s.projectB._id.toString())).toBeNull();
  });

  it("a logged-out visitor gets nothing", async () => {
    actAs(null);
    expect(await getAuthorizedProjectName("ws-b", s.projectB._id.toString())).toBeNull();
  });
});