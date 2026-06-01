import { Skeleton } from "@/app/components/Skeleton";

export default function PostsLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-56" />
      </div>

      <div className="space-y-4 rounded-2xl border border-border-base bg-surface p-4 dark:border-border-sub dark:bg-surface-sub">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-border-base bg-surface p-4 dark:border-border-sub dark:bg-surface-sub">
        <Skeleton className="h-7 w-40" />
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}
