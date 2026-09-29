"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  FolderKanban,
  Pencil,
  Archive,
  Trash2,
  RotateCcw,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn, formatDate } from "@/lib/utils";
import {
  archiveProject,
  deleteProject,
  restoreProject,
} from "@/actions/project";
import EditProjectDialog from "./edit-project-dialog";

interface ProjectCardProps {
  project: {
    _id: string;
    name: string;
    description?: string;
    color: string;
    status: string;
    createdAt: string;
    taskCount: number;
    completedCount: number;
  };
  workspaceSlug: string;
  canManage: boolean;
}

export default function ProjectCard({
  project,
  workspaceSlug,
  canManage,
}: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isArchived = project.status === "archived";

  function handleArchive() {
    setMenuOpen(false);
    startTransition(async () => {
      const result = await archiveProject(workspaceSlug, project._id);
      if (!result.success) toast.error(result.error || "Failed to archive project");
      else toast.success("Project archived");
    });
  }

  function handleRestore() {
    setMenuOpen(false);
    startTransition(async () => {
      const result = await restoreProject(workspaceSlug, project._id);
      if (!result.success) toast.error(result.error || "Failed to restore project");
      else toast.success("Project restored");
    });
  }

  function handleDelete() {
    setMenuOpen(false);
    if (
      !confirm(
        `"${project.name}" and all its tasks will be permanently deleted. Confirm?`,
      )
    )
      return;

    startTransition(async () => {
      const result = await deleteProject(workspaceSlug, project._id);
      if (!result.success) toast.error(result.error || "Failed to delete project");
      else toast.success("Project deleted");
    });
  }

  return (
    <>
      <div
        className={cn(
          "border rounded-lg p-4 bg-card hover:border-primary/40 transition-colors group relative",
          isArchived && "opacity-60",
          isPending && "opacity-50 pointer-events-none",
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: project.color + "20" }}
          >
            <FolderKanban
              className="w-4 h-4"
              style={{ color: project.color }}
            />
          </div>

          {canManage && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpen((o) => !o);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-accent"
              >
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>

              {menuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-7 z-20 bg-card border rounded-lg shadow-md min-w-36 py-1">
                    <button
                      className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm hover:bg-accent"
                      onClick={() => {
                        setMenuOpen(false);
                        setEditOpen(true);
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>

                    {isArchived ? (
                      <button
                        className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm hover:bg-accent"
                        onClick={handleRestore}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Restore
                      </button>
                    ) : (
                      <button
                        className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm hover:bg-accent"
                        onClick={handleArchive}
                      >
                        <Archive className="w-3.5 h-3.5" />
                        Archive
                      </button>
                    )}

                    <div className="border-t my-1" />

                    <button
                      className="flex items-center gap-2 w-full text-left px-3 py-1.5 text-sm hover:bg-accent text-destructive"
                      onClick={handleDelete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <Link
          href={`/${workspaceSlug}/projects/${project._id}`}
          className="block"
        >
          <h3 className="font-semibold text-sm mb-1 hover:underline line-clamp-1">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}
        </Link>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {formatDate(project.createdAt)}
          </span>

          <div className="flex items-center gap-2">
            {isArchived && (
              <span className="text-xs px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                Archived
              </span>
            )}
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: project.color + "20",
                color: project.color,
              }}
            >
              {project.completedCount}/{project.taskCount}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <EditProjectDialog
        workspaceSlug={workspaceSlug}
        project={project}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}
