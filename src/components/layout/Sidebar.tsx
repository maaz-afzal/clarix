"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Bell,
  Search,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  workspaceSlug: string;
  workspaceName: string;
  isCollapsed: boolean;
  onToggle: () => void
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

export default function Sidebar({
  workspaceSlug,
  workspaceName,
  isCollapsed,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: `/${workspaceSlug}/dashboard`,
      icon: LayoutDashboard,
    },
    {
      label: "Projects",
      href: `/${workspaceSlug}/projects`,
      icon: FolderKanban,
    },
    {
      label: "Search",
      href: `/${workspaceSlug}/search`,
      icon: Search,
    },
    {
      label: "Notifications",
      href: `/${workspaceSlug}/notifications`,
      icon: Bell,
    },
    {
      label: "Settings",
      href: `/${workspaceSlug}/settings`,
      icon: Settings,
    },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-card transition-all duration-200",
        isCollapsed ? "w-16" : "w-60",
      )}
    >
      <div className="border-b p-4">
        <button
          type="button"
          className={cn(
            "flex items-center rounded-md transition-colors hover:bg-accent",
            isCollapsed
              ? "w-full justify-center p-1"
              : "w-full justify-between gap-2 px-2 py-1.5",
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary">
              <span className="text-xs font-bold text-primary-foreground">
                {workspaceName[0]?.toUpperCase()}
              </span>
            </div>

            {!isCollapsed && (
              <span className="truncate text-sm font-semibold">
                {workspaceName}
              </span>
            )}
          </div>

          {!isCollapsed && (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            (item.href !== `/${workspaceSlug}/dashboard` &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center rounded-md text-sm transition-colors",
                isCollapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
                isActive
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />

              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <div
          className={cn(
            "flex cursor-pointer items-center rounded-md transition-colors hover:bg-accent",
            isCollapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
            <span className="text-xs font-medium">U</span>
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">User Name</p>

              <p className="truncate text-xs text-muted-foreground">
                user@email.com
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute right-0 top-1/2 z-50 flex h-10 w-4 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border bg-background shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </aside>
  );
}
