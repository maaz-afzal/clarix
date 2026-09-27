import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { acceptInvitation } from "@/actions/members";
import Link from "next/link";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/login?callbackUrl=/invite/${token}`);
  }

  const result = await acceptInvitation(token);

  if (result.success && result.workspaceSlug) {
    redirect(`/${result.workspaceSlug}/dashboard`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-2xl font-bold">Invitation Error</h1>
        <p className="text-muted-foreground">
          {result.error || "Invitation is not valid"}
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
        >
          Home pe jao
        </Link>
      </div>
    </div>
  );
}
