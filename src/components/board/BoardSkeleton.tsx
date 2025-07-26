import { Skeleton } from '@/components/ui/skeleton'

export function BoardSkeleton() {
  return (
    <div className="flex h-full gap-4 p-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="flex h-full w-[320px] flex-shrink-0 flex-col rounded-lg border bg-muted/30">
          <div className="flex items-center justify-between border-b p-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-8" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
          
          <div className="p-3">
            <Skeleton className="h-3 w-32" />
          </div>
          
          <div className="flex-1 space-y-2 p-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="rounded-lg border bg-card p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-8 w-full" />
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
