"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import {
  Bell,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  Search,
  Settings,
} from "lucide-react";
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import type { SearchResult } from "@/lib/dal/search";

type Status = "idle" | "loading" | "error";

interface CommandPaletteProps {
  workspaceSlug: string;
}

export default function CommandPalette({ workspaceSlug }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      shouldFilter={false}
      title="Search"
      description="Search tasks and projects, or jump to a page."
    >
      <PaletteBody workspaceSlug={workspaceSlug} onClose={() => setOpen(false)} />
    </CommandDialog>
  );
}

function PaletteBody({
  workspaceSlug,
  onClose,
}: {
  workspaceSlug: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const abortRef = useRef<AbortController | null>(null);

  const runSearch = useDebouncedCallback(async (q: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("loading");

    try {
      const params = new URLSearchParams({ workspaceSlug, q });
      const response = await fetch(`/api/search?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Search request failed");

      setResults((await response.json()) as SearchResult);
      setStatus("idle");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus("error");
    }
  }, 300);

  useEffect(() => {
    return () => {
      runSearch.cancel();
      abortRef.current?.abort();
    };
  }, [runSearch]);

  function handleChange(value: string) {
    setQuery(value);

    if (value.trim().length < 2) {
      runSearch.cancel();
      abortRef.current?.abort();
      setResults(null);
      setStatus("idle");
      return;
    }
    runSearch(value.trim());
  }

  function go(href: string) {
    router.push(href);
    onClose();
  }

  const trimmed = query.trim();
  const hasQuery = trimmed.length >= 2;
  const base = `/${workspaceSlug}`;

  const navItems = [
    { label: "Dashboard", href: `${base}/dashboard`, icon: LayoutDashboard },
    { label: "Projects", href: `${base}/projects`, icon: FolderKanban },
    { label: "Notifications", href: `${base}/notifications`, icon: Bell },
    { label: "Settings", href: `${base}/settings`, icon: Settings },
  ];

  return (
    <>
      <CommandInput
        placeholder="Search tasks, projects or jump to a page..."
        value={query}
        onValueChange={handleChange}
      />

      <CommandList>
        {!hasQuery && (
          <CommandGroup heading="Go to">
            {navItems.map((item) => (
              <CommandItem
                key={item.href}
                value={`nav-${item.label}`}
                onSelect={() => go(item.href)}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {hasQuery && status === "loading" && (
          <p role="status" className="py-6 text-center text-sm text-muted-foreground">
            Searching...
          </p>
        )}

        {status === "error" && (
          <p role="alert" className="py-6 text-center text-sm text-destructive">
            Search failed. Please try again.
          </p>
        )}

        {hasQuery && status === "idle" && results?.totalCount === 0 && (
          <p role="status" className="py-6 text-center text-sm text-muted-foreground">
            No results for &quot;{trimmed}&quot;
          </p>
        )}

        {hasQuery && results && results.tasks.length > 0 && (
          <CommandGroup heading="Tasks">
            {results.tasks.map((task) => (
              <CommandItem
                key={task._id}
                value={`task-${task._id}`}
                onSelect={() =>
                  go(`${base}/projects/${task.projectId}/tasks/${task._id}`)
                }
              >
                <CheckSquare className="h-4 w-4" aria-hidden="true" />
                <span className="truncate">{task.title}</span>
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {task.projectName}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {hasQuery && results && results.projects.length > 0 && (
          <CommandGroup heading="Projects">
            {results.projects.map((project) => (
              <CommandItem
                key={project._id}
                value={`project-${project._id}`}
                onSelect={() => go(`${base}/projects/${project._id}`)}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded"
                  style={{ backgroundColor: project.color }}
                  aria-hidden="true"
                />
                <span className="truncate">{project.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {hasQuery && (
          <CommandGroup heading="More">
            <CommandItem
              value="all-results"
              onSelect={() =>
                go(`${base}/search?q=${encodeURIComponent(trimmed)}`)
              }
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              See all results for &quot;{trimmed}&quot;
            </CommandItem>
          </CommandGroup>
        )}
      </CommandList>
    </>
  );
}