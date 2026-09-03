type Props = {
  params: Promise<{
    workspaceSlug: string
    projectId: string
  }>
}

export default async function ProjectDetailPage({ params }: Props) {
  const { workspaceSlug, projectId } = await params

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Project Detail</h1>
      <p className="text-muted-foreground">
        Workspace: {workspaceSlug} | Project: {projectId}
      </p>
    </div>
  )
}