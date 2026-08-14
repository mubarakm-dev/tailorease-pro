import { CardGridSkeleton } from "../components/Skeletons"

export default function CustomersLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col gap-6">
      <div>
        <div className="h-8 bg-gray-200 rounded w-40 mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-80 animate-pulse" />
      </div>

      <CardGridSkeleton count={9} />
    </div>
  )
}
