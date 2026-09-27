import connectDB from "@/lib/db";
import WorkspaceMember from "@/models/WorkspaceMember";
import User from "@/models/User";
import Invitation from "@/models/Invitation";
import mongoose from "mongoose";

export interface MemberWithUser {
  memberId: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: {
    name: string;
    email: string;
    image?: string;
  };
}

export interface PendingInvitation {
  _id: string;
  email: string;
  role: string;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
}

export async function getWorkspaceMembers(
  workspaceId: string,
): Promise<MemberWithUser[]> {
  try {
    await connectDB();

    const members = await WorkspaceMember.find({ workspaceId })
      .populate<{
        userId: {
          _id: mongoose.Types.ObjectId;
          name: string;
          email: string;
          image?: string;
        };
      }>("userId", "name email image")
      .sort({ joinedAt: 1 })
      .lean();

    return members
      .filter((m) => m.userId && typeof m.userId === "object")
      .map((m) => {
        const user = m.userId as {
          _id: mongoose.Types.ObjectId;
          name: string;
          email: string;
          image?: string;
        };
        return {
          memberId: m._id.toString(),
          userId: user._id.toString(),
          role: m.role,
          joinedAt: m.joinedAt.toISOString(),
          user: {
            name: user.name,
            email: user.email,
            image: user.image,
          },
        };
      });
  } catch (error) {
    console.error("Failed to fetch members:", error);
    throw new Error("Could not load members");
  }
}

export async function getPendingInvitations(
  workspaceId: string,
): Promise<PendingInvitation[]> {
  try {
    await connectDB();

    const now = new Date();
    const invitations = await Invitation.find({
      workspaceId,
      status: "pending",
      expiresAt: { $gt: now },
    })
      .populate<{ invitedBy: { name: string } }>("invitedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    return invitations.map((inv) => ({
      _id: inv._id.toString(),
      email: inv.email,
      role: inv.role,
      invitedBy: (inv.invitedBy as { name: string })?.name ?? "Unknown",
      createdAt: inv.createdAt.toISOString(),
      expiresAt: inv.expiresAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch invitations:", error);
    throw new Error("Could not load invitations");
  }
}
