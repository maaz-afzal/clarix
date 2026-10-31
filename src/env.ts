const requiredEnvVars = [
  "MONGODB_URI",
  "AUTH_SECRET",
  "GOOGLE_GENERATIVE_AI_API_KEY",
] as const;

function validateEnv() {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        "Please check your .env.local file.",
    );
  }
}

if (process.env.NODE_ENV !== "production") {
  validateEnv();
}

export const env = {
  MONGODB_URI: process.env.MONGODB_URI!,
  AUTH_SECRET: process.env.AUTH_SECRET!,
  GOOGLE_AI_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV ?? "development",
} as const;
