const vercelUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : undefined;

export const siteConfig = {
  name: "Clarix",
  tagline: "AI Project Management",
  description:
    "AI-powered project management for modern teams. Manage projects, collaborate, and ship faster.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? vercelUrl ?? "http://localhost:3000",
};
