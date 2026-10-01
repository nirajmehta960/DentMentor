import { Skeleton } from '@/components/ui/skeleton';
import { HAIRLINE } from '@/components/site';

interface LoadingSkeletonProps {
  viewMode: 'grid' | 'list';
}

/** The card's own silhouette, so results replace placeholders without a jump. */
export const LoadingSkeleton = ({ viewMode }: LoadingSkeletonProps) => {
  if (viewMode === 'list') {
    return (
      <div
        className="flex flex-col gap-5 rounded-xl border bg-white p-5 sm:flex-row sm:items-start sm:gap-6 sm:p-6"
        style={{ borderColor: HAIRLINE }}
      >
        <div className="flex min-w-0 flex-1 items-start gap-4 sm:gap-5">
          <Skeleton className="size-16 shrink-0 rounded-full sm:size-20" />
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-1.5">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:w-48">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-11 w-full rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-5 rounded-xl border bg-white p-5 sm:p-6" style={{ borderColor: HAIRLINE }}>
      <div className="flex items-start gap-4">
        <Skeleton className="size-16 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2 pt-1">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-48 max-w-full" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="mt-auto flex flex-col gap-4 border-t pt-4" style={{ borderColor: HAIRLINE }}>
        <Skeleton className="h-5 w-28" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-11 rounded-full" />
          <Skeleton className="h-11 rounded-full" />
        </div>
      </div>
    </div>
  );
};
