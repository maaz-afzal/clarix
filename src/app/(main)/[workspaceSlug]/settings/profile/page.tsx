import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/settings/profile-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profile Settings" };

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = {
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    image: session.user.image ?? undefined,
  };

  return (
    <div className="p-6 max-w-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your personal information
        </p>
      </div>

      <div className="border rounded-xl p-6 bg-card">
        <ProfileForm user={user} />
      </div>
    </div>
  );
}
