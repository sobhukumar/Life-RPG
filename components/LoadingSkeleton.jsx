export default function LoadingSkeleton({ type = 'card', count = 3 }) {
  if (type === 'page') {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
        <div className="h-10 w-64 bg-[#2e263f] rounded-xl mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(count)].map((_, i) => (
            <div key={i} className="h-48 bg-[#231b34] rounded-3xl border-[3px] border-[#120a21]" />
          ))}
        </div>
      </div>
    )
  }

  if (type === 'task') {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="h-20 bg-[#261847] rounded-2xl border-[3px] border-[#120a21]" />
        ))}
      </div>
    )
  }

  if (type === 'stat') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-[#231b34] rounded-2xl border-[3px] border-[#120a21]" />
        ))}
      </div>
    )
  }

  return (
    <div className="animate-pulse space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="h-32 bg-[#231b34] rounded-2xl border-[3px] border-[#120a21]" />
      ))}
    </div>
  )
}
