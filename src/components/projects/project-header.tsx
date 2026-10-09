"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KanbanSquare, List, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectHeaderProps {
  project: {
    _id: string;
    name: string;
    description?: string;
    color: string;
  };
  workspaceSlug: string;
  projectId: string;
}

const VIEWS = [
  { label: "Board", path: "board", icon: KanbanSquare },
  { label: "List", path: "list", icon: List },
  { label: "Analytics", path: "analytics", icon: BarChart3 },
];

export default function ProjectHeader({
  project,
  workspaceSlug,
  projectId,
}: ProjectHeaderProps) {
  const pathname = usePathname();
  const baseUrl = `/${workspaceSlug}/projects/${projectId}`;

  return (
    <div className="border-b bg-background">
      {/* Project info */}
      <div className="px-6 pt-4 pb-0 flex items-center gap-3">
        <div
          className="w-5 h-5 rounded shrink-0"
          style={{ backgroundColor: project.color }}
        />
        <h1 className="text-lg font-bold truncate">{project.name}</h1>
      </div>

      {/* View tabs */}
      <div className="flex px-6 mt-3">
        {VIEWS.map((view) => {
          const href = `${baseUrl}/${view.path}`;
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          const Icon = view.icon;

          return (
            <Link
              key={view.path}
              href={href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm border-b-2 transition-colors mr-1",
                isActive
                  ? "border-primary text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              )}
            >
              <Icon className="w-4 h-4" />
              {view.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
