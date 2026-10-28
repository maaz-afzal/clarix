import { requireWorkspaceMember } from "@/lib/authorization";
import { hasPermission } from "@/lib/authorization";
import type { MemberRole } from "@/lib/authorization";
import SettingsTabs from "@/components/layout/settings-tabs";

type Props = {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
};

export default async function SettingsLayout({ children, params }: Props) {
  const { workspaceSlug } = await params;
  const { membership } = await requireWorkspaceMember(workspaceSlug);

  const canManageMembers = hasPermission(
    membership.role as MemberRole,
    "member_invite",
  );

  const settingsTabs = [
    { label: "General", href: `/${workspaceSlug}/settings` },
    ...(canManageMembers
      ? [{ label: "Members", href: `/${workspaceSlug}/settings/members` }]
      : []),
    { label: "Profile", href: `/${workspaceSlug}/settings/profile` },
  ];

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {membership.workspaceName} workspace settings
        </p>
      </div>

      {/* Tabs */}
      <SettingsTabs tabs={settingsTabs} workspaceSlug={workspaceSlug} />

      {children}
    </div>
  );
}
