import type { Metadata } from "next";
import "./globals.css";
import ToastProvider from "@/components/providers/toast-provider";

export const metadata: Metadata = {
  title: {
    default: "Clarix",
    template: "%s | Clarix",
  },
  description:
    "AI-powered project management for modern teams. Manage projects, collaborate, and ship faster.",
  keywords: ["project management", "AI", "team collaboration", "tasks"],
  authors: [{ name: "Clarix" }],
  creator: "Clarix",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://clarix.app",
    siteName: "Clarix",
    title: "Clarix - AI Project Management",
    description: "AI-powered project management for modern teams.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clarix - AI Project Management",
    description: "AI-powered project management for modern teams.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
