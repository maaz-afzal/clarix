"use client";

import { useRouter, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { useTransition, useState, useRef } from "react";
import { useDebouncedCallback } from "use-debounce";

interface SearchInputProps {
  workspaceSlug: string;
  defaultValue: string;
  defaultType: string;
}

export default function SearchInput({
  workspaceSlug,
  defaultValue,
  defaultType,
}: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(defaultValue);
  const [type, setType] = useState(defaultType);
  const inputRef = useRef<HTMLInputElement>(null);

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
            onClick={handleClear}
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

      {/* Type filter */}
      <div className="flex gap-2">
        {[
          { value: "", label: "All" },
          { value: "task", label: "Tasks" },
          { value: "project", label: "Projects" },
        ].map((opt) => (
          <button
            key={opt.value}
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
