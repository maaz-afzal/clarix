import type { ElementType, ReactNode } from "react"

interface EmptyStateProps {
  icon: ElementType
  title: string
  description?: string
  children?: ReactNode
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-12 text-center">
      <Icon className="mb-3 h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}