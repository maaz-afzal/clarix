"use client";

import { Skeleton } from "@/components/ui/skeleton";
import TaskModal from "@/components/tasks/task-modal";

export default function TaskModalLoading() {
  return (
    <TaskModal>
      <div className="flex flex-col lg:flex-row" aria-busy="true" aria-label="Loading task">
        <div className="flex-1 space-y-4 p-6 lg:overflow-y-auto">
          <div className="space-y-3">
            <Skeleton className="h-8 w-2/3" />
          </div>
          <div className="border-t pt-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-3 mt-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <aside className="w-full shrink-0 border-t p-4 lg:w-64 lg:border-l lg:border-t-0 lg:overflow-y-auto">
          <Skeleton className="h-9 w-full mb-4" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </aside>
      </div>
    </TaskModal>
  );
}