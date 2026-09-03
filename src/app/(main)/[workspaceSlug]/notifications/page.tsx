type Props = {
  params: Promise<{ workspaceSlug: string }>
}

export default async function NotificationsPage({ params }: Props) {
  const { workspaceSlug } = await params

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Notifications</h1>
      <p className="text-muted-foreground">Workspace: {workspaceSlug}</p>
    </div>
  )
}