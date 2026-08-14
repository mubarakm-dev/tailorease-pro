export default function ProfileLoading() {
  return (
    <div className="p-6 max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <div className="h-8 bg-gray-200 rounded w-40 mb-2 animate-pulse" />
      </div>

      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4" />
          <div className="space-y-3">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-10 bg-gray-200 rounded w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
