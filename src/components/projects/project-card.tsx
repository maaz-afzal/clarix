"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal, FolderKanban } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description?: string;
    color: string;
    status: string;
    createdAt: string;
  };
  workspaceSlug: string;
}

export default function ProjectCard({
  project,
  workspaceSlug,
}: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="border rounded-lg p-4 bg-card hover:border-primary/50 transition-colors group relative">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center"
          style={{ backgroundColor: project.color + "20" }}
        >
          <FolderKanban className="w-4 h-4" style={{ color: project.color }} />
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            setMenuOpen((o) => !o);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-accent"
        >
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <Link href={`/${workspaceSlug}/projects/${project.id}`} className="block">
        <h3 className="font-semibold text-sm mb-1 hover:underline">
          {project.name}
        </h3>
        {project.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {project.description}
          </p>
        )}
      </Link>

      <div className="mt-3 pt-3 border-t flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {formatDate(project.createdAt)}
        </span>
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            backgroundColor: project.color + "20",
            color: project.color,
          }}
        >
          {project.status}
        </span>
      </div>

      {menuOpen && (
        <div className="absolute right-4 top-12 bg-card border rounded-md shadow-md z-10 min-w-32 py-1">
          <button
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent"
            onClick={() => setMenuOpen(false)}
          >
            Edit
          </button>
          <button
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-accent text-destructive"
            onClick={() => setMenuOpen(false)}
          >
            Archive
          </button>
        </div>
      )}
    </div>
  );
}
