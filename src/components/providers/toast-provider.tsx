"use client";

import { Toaster } from "react-hot-toast";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ToastProvider() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: isDark ? "hsl(222.2 84% 4.9%)" : "hsl(0 0% 100%)",
          color: isDark ? "hsl(210 40% 98%)" : "hsl(222.2 84% 4.9%)",
          border: `1px solid ${isDark ? "hsl(217.2 32.6% 17.5%)" : "hsl(214.3 31.8% 91.4%)"}`,
        },
      }}
    />
  );
}
