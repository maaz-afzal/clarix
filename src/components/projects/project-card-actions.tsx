"use client";

import { useRef, useState, useTransition } from "react";
import { MoreHorizontal, Pencil, Archive, Trash2, RotateCcw } from "lucide-react";
import { archiveProject, deleteProject, restoreProject } from "@/actions/project";
import { notifyResult } from "@/lib/notify";
import EditProjectDialog from "./edit-project-dialog";

interface ProjectCardActionsProps {
  workspaceSlug: string;
  project: {
    _id: string;
    name: string;
    description?: string;
    color: string;
    status: string;
  };
}

export default function ProjectCardActions({
  workspaceSlug,
  project,
}: ProjectCardActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const isArchived = project.status === "archived";

  function handleArchive() {
    setMenuOpen(false);
    startTransition(async () => {
      notifyResult(await archiveProject(workspaceSlug, project._id), "Project archived");
    });
  }

  function handleRestore() {
    setMenuOpen(false);
    startTransition(async () => {
      notifyResult(await restoreProject(workspaceSlug, project._id), "Project restored");
    });
  }

  function handleDelete() {
    setMenuOpen(false);
    if (!confirm(`"${project.name}" and all its tasks will be permanently deleted. Continue?`)) return;
    startTransition(async () => {
      notifyResult(await deleteProject(workspaceSlug, project._id), "Project deleted");
    });
  }

  return (
    <>
      <div className="relative">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          disabled={isPending}
          aria-label={`Actions for ${project.name}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="rounded p-1 opacity-0 transition-opacity hover:bg-accent focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-50"
        >
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-7 z-20 min-w-36 rounded-lg border bg-card py-1 shadow-md" role="menu">
              <button
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-accent"
                onClick={() => {
                  setMenuOpen(false);
                  setEditOpen(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Edit
              </button>
              {isArchived ? (
                <button role="menuitem" className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-accent" onClick={handleRestore}>
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Restore
                </button>
              ) : (
                <button role="menuitem" className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-accent" onClick={handleArchive}>
                  <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                  Archive
                </button>
              )}
              <div className="my-1 border-t" />
              <button role="menuitem" className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-destructive hover:bg-accent" onClick={handleDelete}>
                <Trash2 className="h-3.5 h-3.5" aria-hidden="true" />
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      <EditProjectDialog
        workspaceSlug={workspaceSlug}
        project={project}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        returnFocusRef={menuButtonRef}
      />
    </>
  );
}