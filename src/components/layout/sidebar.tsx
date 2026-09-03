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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  workspaceSlug: string;
  workspaceName: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

export default function Sidebar({
  workspaceSlug,
  workspaceName,
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
    <aside className="w-60 h-screen border-r bg-card flex flex-col fixed left-0 top-0">
      {/* Workspace Header */}
      <div className="p-4 border-b">
        <button className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center shrink-0">
              <span className="text-primary-foreground text-xs font-bold">
                {workspaceName[0]?.toUpperCase()}
              </span>
            </div>
            <span className="font-semibold text-sm truncate">
              {workspaceName}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom - User */}
      <div className="p-3 border-t">
        <div className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
            <span className="text-xs font-medium">U</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">User Name</p>
            <p className="text-xs text-muted-foreground truncate">
              user@email.com
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
