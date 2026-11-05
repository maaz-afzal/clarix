import { Skeleton } from "@/components/ui/skeleton"

export default function TaskDetailLoading() {
  return (
    <div className="flex flex-1 flex-col lg:flex-row" aria-busy="true" aria-label="Loading task">
      <div className="flex-1 space-y-4 p-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="w-full space-y-3 border-t p-4 lg:w-64 lg:border-l lg:border-t-0">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  )
}