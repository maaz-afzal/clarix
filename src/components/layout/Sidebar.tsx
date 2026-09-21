"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Bell,
  Search,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import LogoutButton from "../auth/logout-button";
import WorkspaceSwitcher from "@/components/layout/workspace-switcher";

interface SidebarProps {
  workspaceSlug: string;
  workspaceName: string;
  isCollapsed: boolean;
  onToggle: () => void;
  user: {
    name: string;
    email: string;
    image?: string;
  };
  workspaces: {
    _id: string;
    name: string;
    slug: string;
    role: string;
  }[];
  navProjects: {
    _id: string;
    name: string;
    color: string;
  }[];
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
  user,
  workspaces,
  navProjects,
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
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-card transition-[width] duration-200",
        isCollapsed ? "w-16" : "w-60",
      )}
    >
      <div
        className={cn(
          "border-b transition-[padding] duration-200",
          isCollapsed ? "p-2" : "p-4",
        )}
      >
        <WorkspaceSwitcher
          currentSlug={workspaceSlug}
          workspaceName={workspaceName}
          workspaces={workspaces}
          isCollapsed={isCollapsed}
        />
      </div>

      <nav
        className={cn(
          "flex-1 overflow-y-auto transition-[padding] duration-200",
          isCollapsed ? "space-y-1 p-2" : "space-y-1 p-3",
        )}
      >
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
                isCollapsed ? "h-10 justify-center px-0" : "gap-3 px-3 py-2",
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

        {navProjects.length > 0 && (
          <div className="mt-4">
            {!isCollapsed && (
              <p className="mb-1 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Projects
              </p>
            )}

            <div className="space-y-0.5">
              {navProjects.map((project) => {
                const isActive = pathname.includes(project._id);

                return (
                  <Link
                    key={project._id}
                    href={`/${workspaceSlug}/projects/${project._id}`}
                    title={isCollapsed ? project.name : undefined}
                    className={cn(
                      "flex items-center rounded-md text-sm transition-colors",
                      isCollapsed
                        ? "h-10 justify-center px-0"
                        : "gap-3 px-3 py-1.5",
                      isActive
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    <div
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />

                    {!isCollapsed && (
                      <span className="truncate">{project.name}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      <div
        className={cn(
          "border-t transition-[padding] duration-200",
          isCollapsed ? "p-2" : "p-3",
        )}
      >
        <div
          className={cn(
            "flex items-center rounded-md transition-colors hover:bg-accent",
            isCollapsed ? "h-10 justify-center px-0" : "gap-3 px-3 py-2",
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-primary">
                {user.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>

              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>

              <LogoutButton />
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute right-0 top-1/2 z-50 flex h-10 w-5 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border bg-background shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
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
