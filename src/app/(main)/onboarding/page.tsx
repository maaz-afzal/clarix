import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWorkspacesByUser } from "@/lib/dal/workspace";
import WorkspaceForm from "@/components/onboarding/workspace-form";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const workspaces = await getWorkspacesByUser(session.user.id);

  if (workspaces.length > 0) {
    redirect(`/${workspaces[0].slug}/dashboard`);
  }

  const userName = session.user.name ?? "there";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Clarix</h1>
          <p className="text-xl font-medium">Welcome, {userName}!</p>
          <p className="text-muted-foreground">
            Create your workspace and start working with your team.
          </p>
        </div>

        <div className="border rounded-xl p-6 bg-card shadow-sm">
          <WorkspaceForm />
        </div>
      </div>
    </div>
  );
}
