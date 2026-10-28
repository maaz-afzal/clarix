"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SettingsTabsProps {
  tabs: { label: string; href: string }[];
  workspaceSlug: string;
}

export default function SettingsTabs({ tabs, workspaceSlug }: SettingsTabsProps) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 border-b mb-6">
      {tabs.map((tab) => {
        const isProfileTab = tab.href === "/settings/profile";
        const isActive = isProfileTab
          ? pathname === "/settings/profile" || pathname.startsWith("/settings/profile/")
          : pathname === tab.href || pathname.startsWith(tab.href + "/");

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              isActive
                ? "text-foreground border-primary"
                : "text-muted-foreground hover:text-foreground border-transparent hover:border-border"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}