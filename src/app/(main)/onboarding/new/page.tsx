import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import WorkspaceForm from "@/components/onboarding/workspace-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Workspace",
};

export default async function NewWorkspacePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Create a new workspace
          </h1>
          <p className="text-muted-foreground text-sm">
            Organize your projects in a separate workspace
          </p>
        </div>

        <div className="border rounded-xl p-6 bg-card shadow-sm">
          <WorkspaceForm />
        </div>
      </div>
    </div>
  );
}
