"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/layout/Sidebar";
import CommandPalette from "@/components/search/command-palette";
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

  useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-background">
      <CommandPalette workspaceSlug={workspaceSlug} />

      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-60 focus:rounded-md focus:border focus:bg-background focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to main content
      </a>

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
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={mobileOpen}
        className={cn(
          "fixed top-3 left-3 z-50 p-2 rounded-md bg-background border shadow-sm md:hidden",
        )}
      >
        <Menu className="w-4 h-4" aria-hidden="true" />
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
        <main
          id="main-content"
          tabIndex={-1}
          className="min-h-screen min-w-0 px-4 pb-6 pt-20 sm:px-6 md:px-8 md:pt-6"
        >
          <div className="mx-auto w-full max-w-screen-2xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
