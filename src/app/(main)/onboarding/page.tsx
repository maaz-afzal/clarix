import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWorkspacesByUser } from "@/lib/dal/workspace";
import WorkspaceForm from "@/components/onboarding/workspace-form";

export const metadata: Metadata = {
  title: "Create Workspace",
};

const features = [
  "Manage unlimited projects",
  "AI-powered task planning",
  "Team collaboration with roles",
  "Real-time analytics",
];

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const workspaces = await getWorkspacesByUser(session.user.id);

  if (workspaces.length > 0) {
    redirect(`/${workspaces[0].slug}/dashboard`);
  }

  const userName = session.user.name ?? "to Clarix";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">Clarix</h1>

            <p className="text-2xl font-semibold">Welcome, {userName}!</p>

            <p className="text-muted-foreground">
              Create your workspace and start working with your team.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              Everything you need to manage your work
            </h2>

            <div className="space-y-3">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border rounded-xl p-6 bg-card shadow-sm">
          <WorkspaceForm />
        </div>
      </div>
    </div>
  );
}
