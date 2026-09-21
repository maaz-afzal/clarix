"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/layout/Sidebar";

type Workspace = {
  _id: string;
  name: string;
  slug: string;
  role: string;
};

type Props = {
  children: React.ReactNode;
  workspaceSlug: string;
  workspaceName: string;
  user: {
    name: string;
    email: string;
    image?: string;
  };
  workspaces: Workspace[];
  navProjects: {
    _id: string;
    name: string;
    color: string;
  }[];
};

export default function WorkspaceShell({
  children,
  workspaceSlug,
  workspaceName,
  user,
  workspaces,
  navProjects,
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar
        workspaceSlug={workspaceSlug}
        workspaceName={workspaceName}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((prev) => !prev)}
        user={user}
        workspaces={workspaces}
        navProjects={navProjects}
      />

      <div
        className={cn(
          "min-h-screen transition-[margin] duration-200",
          isCollapsed ? "ml-16" : "ml-60",
        )}
      >
        <main className="min-h-screen overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}