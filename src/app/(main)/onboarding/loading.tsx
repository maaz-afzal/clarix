export default function OnboardingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
            <div className="h-7 w-64 bg-muted animate-pulse rounded-md" />
            <div className="h-4 w-80 bg-muted animate-pulse rounded-md" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-5 w-56 bg-muted animate-pulse rounded-md"
              />
            ))}
          </div>
        </div>
        <div className="border rounded-xl p-6 bg-card shadow-sm space-y-4">
          <div className="h-6 w-40 bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
          <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
        </div>
      </div>
    </div>
  );
}