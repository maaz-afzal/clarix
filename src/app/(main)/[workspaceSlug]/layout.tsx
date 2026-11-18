import { redirect } from "next/navigation";
import { requireAuth, requireWorkspaceMember } from "@/lib/authorization";
import { getWorkspacesByUser } from "@/lib/dal/workspace";
import WorkspaceShell from "@/components/layout/workspaceShell";
import { getProjectsForNav } from "@/lib/dal/project";
import { getUnreadCount } from "@/lib/dal/notifications";

type Props = {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
};

export default async function WorkspaceLayout({ children, params }: Props) {
  const { workspaceSlug } = await params;

  const user = await requireAuth();

  const [{ membership }, workspaces] = await Promise.all([
    requireWorkspaceMember(workspaceSlug),
    getWorkspacesByUser(user.id),
  ]);

  const [navProjects, unreadCount] = await Promise.all([
    getProjectsForNav(membership.workspaceId),
    getUnreadCount(user.id, membership.workspaceId),
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
      unreadCount={unreadCount}
    >
      {children}
    </WorkspaceShell>
  );
}
