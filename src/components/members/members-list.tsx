"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";
import { formatRelativeTime } from "@/lib/utils";
import {
  removeMember,
  updateMemberRole,
  cancelInvitation,
} from "@/actions/members";
import type { MemberWithUser, PendingInvitation } from "@/lib/dal/members";

interface MembersListProps {
  workspaceSlug: string;
  members: MemberWithUser[];
  pendingInvitations: PendingInvitation[];
  currentUserId: string;
  currentUserRole: string;
}

function MemberRow({
  member,
  workspaceSlug,
  currentUserId,
  currentUserRole,
}: {
  member: MemberWithUser;
  workspaceSlug: string;
  currentUserId: string;
  currentUserRole: string;
}) {
  const [isPending, startTransition] = useTransition();

  const canManage =
    ["owner", "admin"].includes(currentUserRole) &&
    member.userId !== currentUserId &&
    member.role !== "owner";

  const canChangeRole = currentUserRole === "owner" && canManage;

  function handleRemove() {
    if (!confirm(`Remove ${member.user.name}?`)) return;
    startTransition(async () => {
      const result = await removeMember(workspaceSlug, member.userId);
      if (!result.success) toast.error(result.error || "Could not remove member");
      else toast.success("Member removed");
    });
  }

  function handleRoleChange(newRole: string) {
    startTransition(async () => {
      const result = await updateMemberRole(
        workspaceSlug,
        member.userId,
        newRole,
      );
      if (!result.success)
        toast.error(result.error || "Could not update role");
      else toast.success("Role updated");
    });
  }

  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0">
      {/* Avatar */}
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
        {member.user.image ? (
          <img
            src={member.user.image}
            alt={member.user.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs font-semibold text-primary">
            {member.user.name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{member.user.name}</p>
        <p className="text-xs text-muted-foreground truncate">
          {member.user.email}
        </p>
      </div>

      {/* Role */}
      <div className="flex items-center gap-2">
        {canChangeRole ? (
          <select
            value={member.role}
            onChange={(e) => handleRoleChange(e.target.value)}
            disabled={isPending}
            className="text-xs border rounded px-2 py-1 bg-background disabled:opacity-50"
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
          </select>
        ) : (
          <span className="text-xs px-2 py-1 bg-muted rounded capitalize">
            {member.role}
          </span>
        )}

        {canManage && (
          <button
            onClick={handleRemove}
            disabled={isPending}
            className="text-xs text-destructive hover:underline disabled:opacity-50"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

export default function MembersList({
  workspaceSlug,
  members,
  pendingInvitations,
  currentUserId,
  currentUserRole,
}: MembersListProps) {
  const [isPending, startTransition] = useTransition();

  function handleCancelInvitation(invitationId: string) {
    startTransition(async () => {
      const result = await cancelInvitation(workspaceSlug, invitationId);
      if (!result.success) toast.error(result.error || "Could not cancel invitation");
      else toast.success("Invitation canceled");
    });
  }

  return (
    <div className="space-y-6">
      {/* Active Members */}
      <div>
        <h3 className="text-sm font-medium mb-3">Members ({members.length})</h3>
        <div className="border rounded-lg px-4">
          {members.map((member) => (
            <MemberRow
              key={member.memberId}
              member={member}
              workspaceSlug={workspaceSlug}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
            />
          ))}
        </div>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">
            Pending Invitations ({pendingInvitations.length})
          </h3>
          <div className="border rounded-lg px-4">
            {pendingInvitations.map((inv) => (
              <div
                key={inv._id}
                className="flex items-center gap-3 py-3 border-b last:border-0"
              >
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <span className="text-xs text-muted-foreground">?</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{inv.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Invited by {inv.invitedBy} ·{" "}
                    {formatRelativeTime(inv.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 bg-yellow-500/10 text-yellow-600 rounded capitalize">
                    {inv.role} · Pending
                  </span>
                  <button
                    onClick={() => handleCancelInvitation(inv._id)}
                    disabled={isPending}
                    className="text-xs text-destructive hover:underline disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
