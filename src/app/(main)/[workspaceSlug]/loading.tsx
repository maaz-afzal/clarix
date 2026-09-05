export default function WorkspaceLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-5 border rounded-lg space-y-4">
            <div className="h-5 w-2/3 bg-muted animate-pulse rounded-md" />

            <div className="space-y-2">
              <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
              <div className="h-4 w-4/5 bg-muted animate-pulse rounded-md" />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded-md" />
              <div className="h-4 w-16 bg-muted animate-pulse rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
