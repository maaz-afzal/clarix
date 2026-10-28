"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/layout/Sidebar";
import SearchShortcut from "@/components/layout/search-shortcut";
import { Menu, X } from "lucide-react";

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
  unreadCount: number;
};

export default function WorkspaceShell({
  children,
  workspaceSlug,
  workspaceName,
  user,
  workspaces,
  navProjects,
  unreadCount,
}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-background">
      <SearchShortcut workspaceSlug={workspaceSlug} />

      {mobileOpen && (
        <button
          type="button"
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:hidden"
        />
      )}

      {/* Mobile menu button */}
      <button
        type="button"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((prev) => !prev)}
        className={cn(
          "fixed left-4 top-4 z-60 flex h-10 w-10",
          "items-center justify-center rounded-xl border border-border",
          "bg-background text-foreground shadow-sm",
          "transition-colors hover:bg-accent",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring md:hidden",
        )}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <Sidebar
        workspaceSlug={workspaceSlug}
        workspaceName={workspaceName}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((prev) => !prev)}
        onNavigate={closeMobileMenu}
        user={user}
        workspaces={workspaces}
        navProjects={navProjects}
        unreadCount={unreadCount}
        className={cn(
          "transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      />

      <div
        className={cn(
          "min-h-screen min-w-0 transition-[margin] duration-300 ease-in-out",
          isCollapsed ? "md:ml-16" : "md:ml-60",
        )}
      >
        <main className="min-h-screen min-w-0 px-4 pb-6 pt-20 sm:px-6 md:px-8 md:pt-6">
          <div className="mx-auto w-full max-w-screen-2xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
