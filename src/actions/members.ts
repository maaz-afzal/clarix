"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import WorkspaceMember from "@/models/WorkspaceMember";
import Invitation from "@/models/Invitation";
import User from "@/models/User";
import { verifyPermission, verifyWorkspaceMember } from "@/lib/authorization";
import {
  inviteMemberSchema,
  updateMemberRoleSchema,
} from "@/lib/validations/members";
import mongoose from "mongoose";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function inviteMember(
  workspaceSlug: string,
  data: { email: string; role: string },
): Promise<ActionResult> {
  const { userId, membership } = await verifyPermission(
    workspaceSlug,
    "member_invite",
  );

  const result = inviteMemberSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message };
  }

  const { email, role } = result.data;

  try {
    await connectDB();

    const workspaceObjectId = new mongoose.Types.ObjectId(
      membership.workspaceId,
    );

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const existingMember = await WorkspaceMember.findOne({
        workspaceId: workspaceObjectId,
        userId: existingUser._id,
      });
      if (existingMember) {
        return { success: false, error: "This user is already a member" };
      }
    }

    const existingInvitation = await Invitation.findOne({
      workspaceId: workspaceObjectId,
      email,
      status: "pending",
      expiresAt: { $gt: new Date() },
    });
    if (existingInvitation) {
      return {
        success: false,
        error: "An invitation has already been sent to this email",
      };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await Invitation.create({
      workspaceId: workspaceObjectId,
      email,
      role,
      token,
      invitedBy: new mongoose.Types.ObjectId(userId),
      expiresAt,
    });

    const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${token}`;
    console.log(`Invite URL for ${email}: ${inviteUrl}`);

    revalidatePath(`/${workspaceSlug}/settings/members`);

    return { success: true };
  } catch (error) {
    console.error("Invite error:", error);
    return { success: false, error: "Could not send invitation" };
  }
}

export async function removeMember(
  workspaceSlug: string,
  targetUserId: string,
): Promise<ActionResult> {
  const { userId, membership } = await verifyPermission(
    workspaceSlug,
    "member_remove",
  );

  if (targetUserId === userId) {
    return { success: false, error: "You cannot remove yourself" };
  }

  try {
    await connectDB();

    const workspaceObjectId = new mongoose.Types.ObjectId(
      membership.workspaceId,
    );

    const targetMember = await WorkspaceMember.findOne({
      workspaceId: workspaceObjectId,
      userId: new mongoose.Types.ObjectId(targetUserId),
    });

    if (!targetMember) {
      return { success: false, error: "Member not found" };
    }

    if (targetMember.role === "owner") {
      return { success: false, error: "Owner cannot be removed" };
    }

    await WorkspaceMember.findByIdAndDelete(targetMember._id);

    revalidatePath(`/${workspaceSlug}/settings/members`);
    return { success: true };
  } catch (error) {
    console.error("Remove member error:", error);
    return { success: false, error: "Could not remove member" };
  }
}

export async function updateMemberRole(
  workspaceSlug: string,
  targetUserId: string,
  newRole: string,
): Promise<ActionResult> {
  const { userId, membership } = await verifyPermission(
    workspaceSlug,
    "member_role_change",
  );

  if (targetUserId === userId) {
    return { success: false, error: "You cannot change your own role" };
  }

  const result = updateMemberRoleSchema.safeParse({ role: newRole });
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message };
  }

  try {
    await connectDB();

    await WorkspaceMember.findOneAndUpdate(
      {
        workspaceId: new mongoose.Types.ObjectId(membership.workspaceId),
        userId: new mongoose.Types.ObjectId(targetUserId),
      },
      { role: result.data.role },
    );

    revalidatePath(`/${workspaceSlug}/settings/members`);
    return { success: true };
  } catch (error) {
    console.error("Update role error:", error);
    return { success: false, error: "Could not update role" };
  }
}

export async function cancelInvitation(
  workspaceSlug: string,
  invitationId: string,
): Promise<ActionResult> {
  await verifyPermission(workspaceSlug, "member_invite");

  try {
    await connectDB();

    await Invitation.findByIdAndDelete(invitationId);

    revalidatePath(`/${workspaceSlug}/settings/members`);
    return { success: true };
  } catch (error) {
    console.error("Cancel invitation error:", error);
    return { success: false, error: "Could not cancel invitation" };
  }
}

export async function acceptInvitation(token: string): Promise<{
  success: boolean;
  error?: string;
  workspaceSlug?: string;
}> {
  const { userId } = (await verifyWorkspaceMember("").catch(() => ({
    userId: null,
    membership: null,
  }))) as { userId: string | null; membership: unknown };

  const { auth } = await import("@/lib/auth");
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Login is required" };
  }

  try {
    await connectDB();

    const invitation = await Invitation.findOne({
      token,
      status: "pending",
      expiresAt: { $gt: new Date() },
    }).populate<{
      workspaceId: { _id: mongoose.Types.ObjectId; slug: string };
    }>("workspaceId", "slug");

    if (!invitation) {
      return {
        success: false,
        error: "Invitation is not valid or has expired",
      };
    }

    const workspace = invitation.workspaceId as {
      _id: mongoose.Types.ObjectId;
      slug: string;
    };

    const existingMember = await WorkspaceMember.findOne({
      workspaceId: workspace._id,
      userId: new mongoose.Types.ObjectId(session.user.id),
    });

    if (existingMember) {
      await Invitation.findByIdAndUpdate(invitation._id, {
        status: "accepted",
      });
      return { success: true, workspaceSlug: workspace.slug };
    }

    await WorkspaceMember.create({
      workspaceId: workspace._id,
      userId: new mongoose.Types.ObjectId(session.user.id),
      role: invitation.role,
    });

    await Invitation.findByIdAndUpdate(invitation._id, { status: "accepted" });

    return { success: true, workspaceSlug: workspace.slug };
  } catch (error) {
    console.error("Accept invitation error:", error);
    return { success: false, error: "Could not accept invitation" };
  }
}
