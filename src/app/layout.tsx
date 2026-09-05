import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ToastProvider from "@/components/providers/toast-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Clarix - AI Project Management",
    template: "%s | Clarix",
  },
  description: "Manage projects and collaborate with your team using AI-powered insights",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}