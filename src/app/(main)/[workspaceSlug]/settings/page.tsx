type Props = {
  params: Promise<{ workspaceSlug: string }>
}

export default async function SettingsPage({ params }: Props) {
  const { workspaceSlug } = await params

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Workspace Settings</h1>
      <p className="text-muted-foreground">Workspace: {workspaceSlug}</p>
    </div>
  )
}