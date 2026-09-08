"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import connectDB from "@/lib/db";
import User from "@/models/User";

interface RegisterResult {
  success: boolean;
  error?: string;
}

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function registerUser(
  formData: FormData,
): Promise<RegisterResult> {
  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const result = registerSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.errors[0].message,
    };
  }

  const { name, email, password } = result.data;

  try {
    await connectDB();

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return { success: false, error: "This email is already registered" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
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
