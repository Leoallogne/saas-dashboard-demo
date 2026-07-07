import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Sidebar Skeleton */}
      <div className="w-64 border-r border-slate-800/40 bg-slate-900/30 p-6 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl skeleton-pulse" />
          <div className="flex-1">
            <div className="h-4 w-28 rounded-md skeleton-pulse mb-2" />
            <div className="h-3 w-16 rounded-md skeleton-pulse" />
          </div>
        </div>

        <div className="space-y-4 mt-8 flex-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 rounded-lg skeleton-pulse w-full" />
          ))}
        </div>

        <div className="p-4 rounded-xl border border-slate-800/50 bg-slate-900/20">
          <div className="h-3 w-20 rounded-md skeleton-pulse mb-3" />
          <div className="h-6 w-full rounded-md skeleton-pulse" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col p-8 overflow-y-auto space-y-8">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-64 rounded-lg skeleton-pulse mb-2" />
            <div className="h-4 w-40 rounded-md skeleton-pulse" />
          </div>
          <div className="h-10 w-44 rounded-lg skeleton-pulse" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-800/40 bg-slate-900/10 space-y-4">
              <div className="flex justify-between">
                <div className="h-3 w-24 rounded-md skeleton-pulse" />
                <div className="w-6 h-6 rounded-full skeleton-pulse" />
              </div>
              <div className="h-8 w-20 rounded-lg skeleton-pulse" />
              <div className="h-3 w-32 rounded-md skeleton-pulse" />
            </div>
          ))}
        </div>

        {/* Chart & Activities Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-800/40 bg-slate-900/10 space-y-6 h-80">
            <div className="h-4 w-32 rounded-md skeleton-pulse" />
            <div className="h-56 w-full rounded-xl skeleton-pulse" />
          </div>
          <div className="p-6 rounded-2xl border border-slate-800/40 bg-slate-900/10 space-y-6 h-80">
            <div className="h-4 w-32 rounded-md skeleton-pulse" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full skeleton-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-full rounded-md skeleton-pulse" />
                    <div className="h-2 w-16 rounded-md skeleton-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
