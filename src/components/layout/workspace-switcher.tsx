"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Workspace {
  _id: string;
  name: string;
  slug: string;
  role: string;
}

interface WorkspaceSwitcherProps {
  currentSlug: string;
  workspaceName: string;
  workspaces: Workspace[];
  isCollapsed: boolean;
}

export default function WorkspaceSwitcher({
  currentSlug,
  workspaceName,
  workspaces,
  isCollapsed,
}: WorkspaceSwitcherProps) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const canSwitchWorkspace = workspaces.length > 1;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleWorkspaceSwitch(slug: string) {
    setIsOpen(false);

    if (slug === currentSlug) {
      return;
    }

    router.push(`/${slug}/dashboard`);
  }

  function handleCreateWorkspace() {
    setIsOpen(false);
    router.push("/onboarding/new");
  }

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        disabled={!canSwitchWorkspace}
        onClick={() => {
          if (canSwitchWorkspace && !isCollapsed) {
            setIsOpen((prev) => !prev);
          }
        }}
        className={cn(
          "flex h-10 w-full items-center rounded-lg transition-colors",
          isCollapsed ? "justify-center px-0" : "justify-between px-2",
          canSwitchWorkspace && !isCollapsed
            ? "cursor-pointer hover:bg-accent"
            : "cursor-default",
          isOpen && "bg-accent",
        )}
      >
        <div
          className={cn(
            "flex min-w-0 items-center",
            isCollapsed ? "justify-center" : "gap-2.5",
          )}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary">
            <span className="text-xs font-bold text-primary-foreground">
              {workspaceName[0]?.toUpperCase()}
            </span>
          </div>

          {!isCollapsed && (
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold">{workspaceName}</p>

              {canSwitchWorkspace && (
                <p className="text-[11px] text-muted-foreground">
                  {workspaces.length} workspaces
                </p>
              )}
            </div>
          )}
        </div>

        {!isCollapsed && canSwitchWorkspace && (
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              isOpen && "rotate-180",
            )}
          />
        )}
      </button>

      {!isCollapsed && isOpen && canSwitchWorkspace && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-lg border bg-popover p-1.5 shadow-lg">
          <p className="px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Switch workspace
          </p>

          <div className="space-y-0.5">
            {workspaces.map((workspace) => {
              const isCurrent = workspace.slug === currentSlug;

              return (
                <button
                  key={workspace._id}
                  type="button"
                  onClick={() => handleWorkspaceSwitch(workspace.slug)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors",
                    isCurrent ? "bg-accent" : "hover:bg-accent",
                  )}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                    <span className="text-xs font-semibold">
                      {workspace.name[0]?.toUpperCase()}
                    </span>
                  </div>

                  <span className="min-w-0 flex-1 truncate text-left font-medium">
                    {workspace.name}
                  </span>

                  {isCurrent && (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleCreateWorkspace}
        title={isCollapsed ? "Create workspace" : undefined}
        className={cn(
          "mt-1.5 flex h-10 w-full items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
          isCollapsed ? "justify-center px-0" : "gap-2.5 px-2",
        )}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-dashed border-muted-foreground/40">
          <Plus className="h-4 w-4" />
        </div>

        {!isCollapsed && (
          <span className="text-sm font-medium">Create workspace</span>
        )}
      </button>
    </div>
  );
}
