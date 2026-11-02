"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center p-6 font-sans">
        <div role="alert" className="max-w-md space-y-4 text-center">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <p className="text-sm">
            The app failed to load. Please try the page again.
          </p>
          {error.digest && (
            <p className="text-xs">
              Error ID: <span className="font-mono">{error.digest}</span>
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            className="rounded-md border px-4 py-2 text-sm"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
