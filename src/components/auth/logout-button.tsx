"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useState } from "react";

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    await signOut({ redirectTo: "/login" });
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
    >
      {isLoading ? (
        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      {!isLoading && "Logout"}
    </button>
  );
}
