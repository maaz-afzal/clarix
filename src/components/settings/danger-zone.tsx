"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { deleteWorkspace } from "@/actions/workspace";

interface DangerZoneProps {
  workspaceSlug: string;
  workspaceName: string;
  isOwner: boolean;
}

export default function DangerZone({
  workspaceSlug,
  workspaceName,
  isOwner,
}: DangerZoneProps) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isConfirmed = confirmText === workspaceName;

  function handleDelete() {
    if (!isConfirmed) return;

    startTransition(async () => {
      const result = await deleteWorkspace(workspaceSlug);

      if (!result.success) {
        toast.error(result.error || "Failed to delete workspace");
        return;
      }

      toast.success("Workspace deleted successfully");
      router.push("/onboarding");
    });
  }

  if (!isOwner) return null;

  return (
    <div className="border border-destructive/40 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-destructive" />
        <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
      </div>

      <div>
        <p className="text-sm font-medium">Delete Workspace</p>
        <p className="text-xs text-muted-foreground mt-1">
          This action is permanent. All projects, tasks, and members will be
          permanently deleted along with the workspace.
        </p>
      </div>

      {!showConfirm ? (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="px-3 py-1.5 border border-destructive text-destructive text-sm rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          Delete Workspace
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Type the workspace name to confirm:{" "}
            <span className="font-mono font-semibold text-foreground">
              {workspaceName}
            </span>
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={workspaceName}
            className="w-full px-3 py-2 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-destructive/50"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowConfirm(false);
                setConfirmText("");
              }}
              className="px-3 py-1.5 border text-sm rounded-md hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!isConfirmed || isPending}
              className="px-3 py-1.5 bg-destructive text-destructive-foreground text-sm rounded-md hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? "Deleting..." : "Permanently Delete"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
