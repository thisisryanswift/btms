import React from 'react';

interface SkeletonProps {
    className?: string;
    circle?: boolean;
}

export function Skeleton({ className = '', circle = false }: SkeletonProps) {
    return (
        <div
            className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${circle ? 'rounded-full' : 'rounded'} ${className}`}
        />
    );
}

export function SessionItemSkeleton() {
    return (
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <div className="flex space-x-2">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-12" />
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Skeleton className="h-7 w-16" />
                    <Skeleton className="h-7 w-8" />
                </div>
            </div>
            <div className="space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
            </div>
        </div>
    );
}
