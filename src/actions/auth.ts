"use server";

import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";

interface RegisterResult {
  success: boolean;
  error?: string;
}

export async function registerUser(
  input: RegisterInput,
): Promise<RegisterResult> {
  const result = registerSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      error: result.error.errors[0].message,
    };
  }

  const { name, email, password } = result.data;

  try {
    await connectDB();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return { success: false, error: "This email is already registered" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name: name.trim(),
      email,
      password: hashedPassword,
    });

    return { success: true };
  } catch (error) {
    console.error("Register error:", error);
    return {
      success: false,
      error: "Could not create account. Please try again.",
    };
  }
}
