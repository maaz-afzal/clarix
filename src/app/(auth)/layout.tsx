import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <header className="p-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground text-xs font-bold">C</span>
          </div>
          <span className="font-bold">Clarix</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>

      <footer className="p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Clarix - AI Project Management
        </p>
      </footer>
    </div>
  );
}
