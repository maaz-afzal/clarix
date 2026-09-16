"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import CreateProjectForm from "./create-project-form";

interface CreateProjectDialogProps {
  workspaceSlug: string;
}

export default function CreateProjectDialog({
  workspaceSlug,
}: CreateProjectDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        <Plus className="w-4 h-4" />
        New Project
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md bg-card border rounded-xl shadow-lg p-6 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Project</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md hover:bg-accent transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <CreateProjectForm
              workspaceSlug={workspaceSlug}
              onSuccess={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
