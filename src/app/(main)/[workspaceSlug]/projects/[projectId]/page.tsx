import { requireWorkspaceMember, hasPermission } from "@/lib/authorization";
import { getProjectById } from "@/lib/dal/project";
import { notFound } from "next/navigation";
import Link from "next/link";
import { KanbanSquare, List, BarChart3 } from "lucide-react";
import type { MemberRole } from "@/lib/authorization";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ workspaceSlug: string; projectId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params;
  const project = await getProjectById(projectId);
  return { title: project?.name ?? "Project" };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { workspaceSlug, projectId } = await params;

  const { membership } = await requireWorkspaceMember(workspaceSlug);
  const project = await getProjectById(projectId);

  if (!project || project.workspaceId !== membership.workspaceId) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">Select a view from above</p>
          <Link
            href={`/${workspaceSlug}/projects/${projectId}/board`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
          >
            <KanbanSquare className="w-4 h-4" />
            Kanban Board
          </Link>
        </div>
      </div>
    </div>
  );
}
