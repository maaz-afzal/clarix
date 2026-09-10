import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import WorkspaceForm from "@/components/layout/workspace-form";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userName = session.user.name || "there";

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-lg p-8 border rounded-lg">
        <h1 className="text-2xl font-bold mb-2">
          Welcome, {userName}! Apna workspace banao.
        </h1>

        <p className="text-muted-foreground mb-6">
          Apne workspace ka naam choose karein.
        </p>

        <WorkspaceForm />
      </div>
    </div>
  );
}