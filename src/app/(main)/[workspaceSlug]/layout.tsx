import { redirect } from "next/navigation";
import { requireWorkspaceMember } from "@/lib/authorization";
import WorkspaceShell from "@/components/layout/workspaceShell";

type Props = {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
};

export default async function WorkspaceLayout({ children, params }: Props) {
  const { workspaceSlug } = await params;
  const { user, membership } = await requireWorkspaceMember(workspaceSlug);

  const user_data = {
    name: user.name ?? "User",
    email: user.email ?? "",
    image: user.image ?? undefined,
  };

  return (
    <WorkspaceShell
      workspaceSlug={workspaceSlug}
      workspaceName={membership.workspaceName}
      user={user_data}
    >
      {children}
    </WorkspaceShell>
  );
}
