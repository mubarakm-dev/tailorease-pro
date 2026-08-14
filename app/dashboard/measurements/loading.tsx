import { CardGridSkeleton, TableSkeleton } from "../components/Skeletons"

export default function MeasurementsLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-80 animate-pulse" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 w-fit min-w-35 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-10 bg-gray-200 rounded w-12" />
      </div>

      <TableSkeleton />
    </div>
  )
}
