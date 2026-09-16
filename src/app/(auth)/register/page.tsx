import type { Metadata } from "next"
import RegisterForm from "@/components/auth/register-form"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your free Clarix account",
}

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="text-muted-foreground text-sm">
          Start managing your projects with AI assistance
        </p>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <RegisterForm />
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors block"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}