import type { Metadata } from "next";
import LoginForm from "@/components/auth/login-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Clarix account",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          Sign in to your account to continue
        </p>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <LoginForm />
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary font-medium hover:underline"
          >
            Sign up free
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
  );
}
