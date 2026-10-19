"use client";

import { useRouter, usePathname } from "next/navigation";
import { Search, X, Clock, Trash2, ArrowUpRight } from "lucide-react";
import { useTransition, useState, useRef, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

interface SearchInputProps {
  workspaceSlug: string;
  defaultValue: string;
  defaultType: string;
  searchCompleted: boolean;
}

const MAX_RECENT_SEARCHES = 5;

export default function SearchInput({
  workspaceSlug,
  defaultValue,
  defaultType,
  searchCompleted,
}: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(defaultValue);
  const [type, setType] = useState(defaultType);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const storageKey = `recent-searches:${workspaceSlug}`;

  useEffect(() => {
    let history: string[] = [];

    try {
      const stored = localStorage.getItem(storageKey);
      const parsed: unknown = stored ? JSON.parse(stored) : [];

      if (Array.isArray(parsed)) {
        history = parsed.filter(
          (item): item is string =>
            typeof item === "string" && item.trim().length >= 2,
        );
      }
    } catch {
      history = [];
    }

    if (searchCompleted && defaultValue.trim().length >= 2) {
      const query = defaultValue.trim();

      history = [
        query,
        ...history.filter((item) => item.toLowerCase() !== query.toLowerCase()),
      ].slice(0, MAX_RECENT_SEARCHES);

      try {
        localStorage.setItem(storageKey, JSON.stringify(history));
      } catch {}
    }

    setRecentSearches(history);
  }, [defaultValue, searchCompleted, storageKey]);

  useEffect(() => {
    setValue(defaultValue);
    setType(defaultType);
  }, [defaultValue, defaultType]);

  const debouncedSearch = useDebouncedCallback((query: string) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (type) params.set("type", type);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, 400);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    debouncedSearch(e.target.value);
  }

  function handleClear() {
    debouncedSearch.cancel();
    setValue("");
    router.push(pathname);
    inputRef.current?.focus();
  }

  function handleTypeChange(newType: string) {
    setType(newType);
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    if (newType) params.set("type", newType);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleRecentSearch(query: string) {
    debouncedSearch.cancel();
    setValue(query);

    const params = new URLSearchParams();
    params.set("q", query);
    if (type) params.set("type", type);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });

    inputRef.current?.focus();
  }

  function handleClearRecentSearches() {
    try {
      localStorage.removeItem(storageKey);
    } catch {}

    setRecentSearches([]);
  }

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Search tasks, projects..."
          autoFocus
          className="w-full pl-10 pr-10 py-2.5 border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search input"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin block" />
          </div>
        )}
      </div>

      {/* Recent searches */}
      {!value.trim() && recentSearches.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              Recent searches
            </h3>

            <button
              type="button"
              onClick={handleClearRecentSearches}
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border">
            {recentSearches.map((query, index) => (
              <button
                key={query.toLowerCase()}
                type="button"
                onClick={() => handleRecentSearch(query)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60 ${
                  index !== 0 ? "border-t" : ""
                }`}
              >
                <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />

                <span className="min-w-0 flex-1 truncate text-sm">{query}</span>

                <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Type filter */}
      <div className="flex gap-2">
        {[
          { value: "", label: "All" },
          { value: "task", label: "Tasks" },
          { value: "project", label: "Projects" },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleTypeChange(opt.value)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              type === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
