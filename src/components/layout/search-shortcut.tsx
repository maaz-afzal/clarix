"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface SearchShortcutProps {
  workspaceSlug: string;
}

export default function SearchShortcut({ workspaceSlug }: SearchShortcutProps) {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        router.push(`/${workspaceSlug}/search`);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [workspaceSlug, router]);

  return null;
}
