import LoginForm from "@/components/auth/login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Clarix</h1>
          <p className="text-muted-foreground">Log in to your account</p>
        </div>

        {/* Form */}
        <div className="border rounded-xl p-6 bg-card shadow-sm space-y-4">
          <LoginForm />
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-primary font-medium hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
