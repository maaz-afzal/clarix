"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Pencil, Archive, Trash2, RotateCcw } from "lucide-react";
import { archiveProject, deleteProject, restoreProject } from "@/actions/project";
import { notifyResult } from "@/lib/notify";
import EditProjectDialog from "./edit-project-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

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
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isArchived = project.status === "archived";

  function handleArchive() {
    startTransition(async () => {
      notifyResult(await archiveProject(workspaceSlug, project._id), "Project archived");
    });
  }

  function handleRestore() {
    startTransition(async () => {
      notifyResult(await restoreProject(workspaceSlug, project._id), "Project restored");
    });
  }

  function handleDelete() {
    if (!confirm(`"${project.name}" and all its tasks will be permanently deleted. Continue?`)) return;
    startTransition(async () => {
      notifyResult(await deleteProject(workspaceSlug, project._id), "Project deleted");
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button
            type="button"
            disabled={isPending}
            aria-label={`Actions for ${project.name}`}
            className="rounded p-1 opacity-0 transition-opacity hover:bg-accent focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-50"
          >
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" side="bottom" sideOffset={4}>
          <DropdownMenuItem
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-2"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </DropdownMenuItem>

          {isArchived ? (
            <DropdownMenuItem onClick={handleRestore} className="flex items-center gap-2">
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Restore
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={handleArchive} className="flex items-center gap-2">
              <Archive className="h-3.5 w-3.5" aria-hidden="true" />
              Archive
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleDelete}
            className="flex items-center gap-2 text-destructive focus:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditProjectDialog
        workspaceSlug={workspaceSlug}
        project={project}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}