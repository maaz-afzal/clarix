import WorkspaceShell from "@/components/layout/workspaceShell";

type Props = {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
};

export default async function WorkspaceLayout({ children, params }: Props) {
  const { workspaceSlug } = await params;

  const workspaceName = workspaceSlug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <WorkspaceShell workspaceSlug={workspaceSlug} workspaceName={workspaceName}>
      {children}
    </WorkspaceShell>
  );
}
