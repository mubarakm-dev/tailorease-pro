export default function CompanyLoading() {
  return (
    <div className="p-6 max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-80 animate-pulse" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-10 bg-gray-200 rounded w-full" />
            </div>
          ))}
          <div className="h-10 bg-gray-200 rounded w-32 mt-6" />
        </div>
      </div>
    </div>
  )
}
