import { TableSkeleton } from "../components/Skeletons"

export default function OrdersLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
      <div>
        <div className="h-8 bg-gray-200 rounded w-40 mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-96 animate-pulse" />
      </div>

      <div className="flex gap-3 flex-wrap">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
        ))}
      </div>

      <TableSkeleton />
    </div>
  )
}
