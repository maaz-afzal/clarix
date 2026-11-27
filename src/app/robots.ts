import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/onboarding",
          "/invite/",
          "/unauthorized",
          "/*/dashboard",
          "/*/projects",
          "/*/search",
          "/*/notifications",
          "/*/settings",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
