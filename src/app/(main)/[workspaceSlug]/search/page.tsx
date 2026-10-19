import { requireWorkspaceMember } from "@/lib/authorization";
import { searchWorkspace } from "@/lib/dal/search";
import SearchResults from "@/components/search/search-results";
import SearchInput from "@/components/search/search-input";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Search" };

type Props = {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<{ q?: string; type?: string }>;
};

export default async function SearchPage({ params, searchParams }: Props) {
  const { workspaceSlug } = await params;
  const { q, type } = await searchParams;

  const { membership } = await requireWorkspaceMember(workspaceSlug);

  const results =
    q && q.trim().length >= 2
      ? await searchWorkspace(
          membership.workspaceId,
          q,
          type as "task" | "project" | undefined,
        )
      : null;

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Search</h1>

      <SearchInput
        workspaceSlug={workspaceSlug}
        defaultValue={q ?? ""}
        defaultType={type ?? ""}
        searchCompleted={results !== null}
      />

      {results !== null && (
        <div className="mt-6">
          <SearchResults
            results={results}
            query={q ?? ""}
            workspaceSlug={workspaceSlug}
          />
        </div>
      )}

      {!q && (
        <div className="mt-12 text-center">
          <p className="text-muted-foreground">Search tasks and projects</p>
          <p className="text-sm text-muted-foreground mt-1">
            Type at least 2 characters
          </p>
        </div>
      )}
    </div>
  );
}
