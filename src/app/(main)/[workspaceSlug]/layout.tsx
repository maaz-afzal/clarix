import { redirect } from "next/navigation";
import { requireWorkspaceMember } from "@/lib/authorization";
import { getWorkspacesByUser } from "@/lib/dal/workspace";
import WorkspaceShell from "@/components/layout/workspaceShell";
import { getProjectsForNav } from "@/lib/dal/project";

type Props = {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
};

export default async function WorkspaceLayout({ children, params }: Props) {
  const { workspaceSlug } = await params;

  const { user, membership } = await requireWorkspaceMember(workspaceSlug);

  const [workspaces, navProjects] = await Promise.all([
    getWorkspacesByUser(user.id),
    getProjectsForNav(membership.workspaceId),
  ]);

  const userData = {
    name: user.name ?? "User",
    email: user.email ?? "",
    image: user.image ?? undefined,
  };

  return (
    <WorkspaceShell
      workspaceSlug={workspaceSlug}
      workspaceName={membership.workspaceName}
      user={userData}
      workspaces={workspaces}
      navProjects={navProjects}
    >
      {children}
    </WorkspaceShell>
  );
}
