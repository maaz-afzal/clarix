import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center">
          <ShieldX className="h-12 w-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">No Access</h1>
        <p className="text-muted-foreground">
          You don't have access to this workspace or it doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
        >
          Go back to Home
        </Link>
      </div>
    </div>
  );
}
