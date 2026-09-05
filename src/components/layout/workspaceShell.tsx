"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/layout/Sidebar";

type Props = {
  children: React.ReactNode;
  workspaceSlug: string;
  workspaceName: string;
};

export default function WorkspaceShell({
  children,
  workspaceSlug,
  workspaceName,
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  function toggleCollapse() {
    setIsCollapsed((prev) => !prev);
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        workspaceSlug={workspaceSlug}
        workspaceName={workspaceName}
        isCollapsed={isCollapsed}
        onToggle={toggleCollapse}
      />

      <div
        className={cn(
          "flex flex-1 flex-col overflow-hidden transition-all duration-200",
          isCollapsed ? "ml-16" : "ml-60",
        )}
      >
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
