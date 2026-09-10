import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import WorkspaceShell from "@/components/layout/workspaceShell";

type Props = {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
};

export default async function WorkspaceLayout({ children, params }: Props) {
  const { workspaceSlug } = await params;

  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const workspaceName = workspaceSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const user = {
    name: session.user.name ?? "User",
    email: session.user.email ?? "",
    image: session.user.image ?? undefined,
  };

  return (
    <WorkspaceShell
      workspaceSlug={workspaceSlug}
      workspaceName={workspaceName}
      user={user}
    >
      {children}
    </WorkspaceShell>
  );
}
