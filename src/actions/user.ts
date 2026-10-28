"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/validations/user";

interface UserActionResult {
  success: boolean;
  error?: string;
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<UserActionResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHENTICATED");

  const result = updateProfileSchema.safeParse(input);
  if (!result.success) {
    return { success: false, error: result.error.errors[0].message };
  }

  try {
    await connectDB();

    await User.findByIdAndUpdate(session.user.id, {
      name: result.data.name,
    });

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
