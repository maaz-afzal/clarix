import { notFound } from "next/navigation";
import { getWorkspaceBySlug } from "@/lib/dal/workspace";
import { requireWorkspaceMember } from "@/lib/authorization";
import { hasPermission, type MemberRole } from "@/lib/authorization";
import WorkspaceSettingsForm from "@/components/settings/workspace-setting-form";
import DangerZone from "@/components/settings/danger-zone";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

type Props = {
  params: Promise<{ workspaceSlug: string }>;
};

export default async function SettingsPage({ params }: Props) {
  const { workspaceSlug } = await params;

  const [workspace, { membership }] = await Promise.all([
    getWorkspaceBySlug(workspaceSlug),
    requireWorkspaceMember(workspaceSlug),
  ]);

  if (!workspace) {
    notFound();
  }

  const canUpdate = hasPermission(
    membership.role as MemberRole,
    "workspace_update",
  );

  const isOwner = membership.role === "owner";

  return (
    <div className="space-y-8">
      {/* General Settings */}
      {canUpdate ? (
        <WorkspaceSettingsForm
          workspaceSlug={workspaceSlug}
          name={workspace.name}
          description={workspace.description ?? ""}
          slug={workspace.slug}
        />
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
              Name
            </p>
            <p className="text-sm">{workspace.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
              Slug
            </p>
            <p className="text-sm font-mono">{workspace.slug}</p>
          </div>
          {workspace.description && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">
                Description
              </p>
              <p className="text-sm">{workspace.description}</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Your role is {membership.role} - you don't have permission to edit
            settings
          </p>
        </div>
      )}

      {/* Danger Zone */}
      <DangerZone
        workspaceSlug={workspaceSlug}
        workspaceName={workspace.name}
        isOwner={isOwner}
      />
    </div>
  );
}
