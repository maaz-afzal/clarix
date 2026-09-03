type Props = {
  params: Promise<{ workspaceSlug: string }>
}

export default async function DashboardPage({ params }: Props) {
  const { workspaceSlug } = await params

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to {workspaceSlug} workspace
        </p>
      </div>

      {/* Stat cards placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {["Total Projects", "Active Tasks", "Completed", "Overdue"].map((label) => (
          <div key={label} className="border rounded-lg p-4 bg-card">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">0</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Real data will be available on Day 23 when we build the dashboard feature.
      </p>
    </div>
  )
}