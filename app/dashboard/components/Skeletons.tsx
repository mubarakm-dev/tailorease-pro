"use client"

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
      <div className="h-10 bg-gray-200 rounded w-16 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-24" />
    </div>
  )
}

export function StatTilesSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
  )
}

export function PipelineSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 space-y-2">
            <div className="h-1 bg-gray-200 rounded w-8 mx-auto mb-3" />
            <div className="h-8 bg-gray-200 rounded w-12 mx-auto" />
            <div className="h-3 bg-gray-200 rounded w-16 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="h-4 bg-gray-200 rounded w-24" />
      </div>
      <div className="space-y-3 p-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-10 bg-gray-200 rounded flex-1" />
            <div className="h-10 bg-gray-200 rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ListSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-48" />
          <div className="h-3 bg-gray-200 rounded w-32" />
        </div>
      ))}
    </div>
  )
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-32" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}
