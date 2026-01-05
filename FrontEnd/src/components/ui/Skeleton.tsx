import { cn } from "./utils";

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-md bg-gray-200",
                className
            )}
        />
    );
}

/**
 * Vehicle Card Skeleton - for loading states
 */
export function VehicleCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <Skeleton className="aspect-[4/3] rounded-none" />
            <div className="p-5 space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-3/4" />
                </div>
                <Skeleton className="h-3 w-1/2" />
                <div className="grid grid-cols-4 gap-2 py-4 border-t border-b border-gray-100">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <Skeleton className="w-4 h-4 rounded" />
                            <Skeleton className="h-2 w-8" />
                        </div>
                    ))}
                </div>
                <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-10 w-24 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

/**
 * Vehicle Grid Skeleton - multiple cards
 */
export function VehicleGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(count)].map((_, i) => (
                <VehicleCardSkeleton key={i} />
            ))}
        </div>
    );
}

/**
 * Detail Page Hero Skeleton
 */
export function DetailHeroSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <Skeleton className="aspect-[16/10] rounded-none" />
            <div className="p-4 flex gap-3">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="w-20 h-16 rounded-lg" />
                ))}
            </div>
        </div>
    );
}

