import { notFound } from "next/navigation";
import { getWorkspaceBySlug } from "@/lib/dal/workspace";
import { requireWorkspaceMember } from "@/lib/authorization";
import { hasPermission, type MemberRole } from "@/lib/authorization";
import WorkspaceSettingsForm from "@/components/settings/workspace-setting-form";

type Props = {
  params: Promise<{ workspaceSlug: string }>;
};

export default async function SettingsPage({ params }: Props) {
  const { workspaceSlug } = await params;

  const workspace = await getWorkspaceBySlug(workspaceSlug);

  if (!workspace) {
    notFound();
  }

  const { membership } = await requireWorkspaceMember(workspaceSlug);

  const canUpdate = hasPermission(
    membership.role as MemberRole,
    "workspace_update",
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Workspace Settings</h1>

      {canUpdate ? (
        <WorkspaceSettingsForm
          workspaceSlug={workspaceSlug}
          name={workspace.name}
          description={workspace.description ?? ""}
          slug={workspace.slug}
        />
      ) : (
        <div className="mt-6 space-y-2">
          <p>
            <strong>Name:</strong> {workspace.name}
          </p>

          <p>
            <strong>Description:</strong>{" "}
            {workspace.description || "No description"}
          </p>

          <p>
            <strong>Slug:</strong> {workspace.slug}
          </p>

          <p>
            <strong>Role:</strong> {membership.role}
          </p>
        </div>
      )}
    </div>
  );
}
