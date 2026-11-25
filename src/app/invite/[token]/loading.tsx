export default function InviteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md w-full">
        <div className="h-7 w-48 bg-muted animate-pulse rounded-md mx-auto" />
        <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
        <div className="h-4 w-3/4 bg-muted animate-pulse rounded-md mx-auto" />
      </div>
    </div>
  );
}