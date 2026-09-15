"use client";

import { useState } from "react";
import { generateSlug } from "@/lib/utils";

export default function WorkspaceForm() {
  const [workspaceName, setWorkspaceName] = useState("");

  const slug = generateSlug(workspaceName);

  return (
    <form className="space-y-4">
      <div>
        <label
          htmlFor="workspaceName"
          className="block text-sm font-medium mb-2"
        >
          Workspace name
        </label>

        <input
          id="workspaceName"
          name="workspaceName"
          type="text"
          placeholder="My Workspace"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          className="w-full border rounded-md px-3 py-2"
        />
      </div>

      {slug && (
        <p className="text-sm text-muted-foreground">URL: clarix.com/{slug}</p>
      )}

      <button
        type="submit"
        className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground"
      >
        Create workspace
      </button>
    </form>
  );
}
