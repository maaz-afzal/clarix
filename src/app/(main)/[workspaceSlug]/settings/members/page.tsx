import { requireWorkspaceMember, hasPermission } from "@/lib/authorization";
import { getWorkspaceMembers, getPendingInvitations } from "@/lib/dal/members";
import InviteMemberForm from "@/components/members/invite-member-form";
import MembersList from "@/components/members/members-list";
import type { MemberRole } from "@/lib/authorization";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Members" };

type Props = {
  params: Promise<{ workspaceSlug: string }>;
};

export default async function MembersPage({ params }: Props) {
  const { workspaceSlug } = await params;
  const { user, membership } = await requireWorkspaceMember(workspaceSlug);

  const canInvite = hasPermission(
    membership.role as MemberRole,
    "member_invite",
  );

  const [members, pendingInvitations] = await Promise.all([
    getWorkspaceMembers(membership.workspaceId),
    canInvite
      ? getPendingInvitations(membership.workspaceId)
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      {/* Invite Section */}
      {canInvite && (
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-semibold">Invite Members</h2>
            <p className="text-sm text-muted-foreground">
              Invite team members to the workspace
            </p>
          </div>
          <InviteMemberForm workspaceSlug={workspaceSlug} />
        </div>
      )}

      {/* Members List */}
      <MembersList
        workspaceSlug={workspaceSlug}
        members={members}
        pendingInvitations={pendingInvitations}
        currentUserId={user.id}
        currentUserRole={membership.role}
      />
    </div>
  );
}
