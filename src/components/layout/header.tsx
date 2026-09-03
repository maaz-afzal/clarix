interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="h-14 border-b bg-background flex items-center px-6 sticky top-0 z-10">
      <h1 className="text-lg font-semibold">{title}</h1>
    </header>
  );
}