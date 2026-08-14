import { StatTilesSkeleton, PipelineSkeleton, TableSkeleton } from "./components/Skeletons"

export default function DashboardLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-8">
      <div>
        <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-80 animate-pulse" />
      </div>

      <StatTilesSkeleton />
      <PipelineSkeleton />
      <TableSkeleton />
    </div>
  )
}
