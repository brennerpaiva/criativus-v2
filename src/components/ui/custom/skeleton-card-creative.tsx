import { Skeleton } from '@/components/ui/skeleton';

export function SkeletonCardCreative() {
  return (
    <div className="flex flex-col">
      <Skeleton className="h-[240px] w-[278px] rounded-l mb-8" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[278px]" />
        <Skeleton className="h-4 w-[278px]" />
      </div>
    </div>
  );
}
