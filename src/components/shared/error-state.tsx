import type { ReactNode } from "react"

interface ErrorStateProps {
  title: string
  description: string
  digest?: string
  children?: ReactNode
}

export default function ErrorState({
  title,
  description,
  digest,
  children,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-1 items-center justify-center p-6"
    >
      <div className="max-w-md space-y-4 text-center">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
        {digest && (
          <p className="text-xs text-muted-foreground">
            Error ID: <span className="font-mono">{digest}</span>
          </p>
        )}
        {children && <div className="flex justify-center gap-3">{children}</div>}
      </div>
    </div>
  )
}