export default function ProductsLoading() {
  return (
    <div className="container mx-auto pt-24 pb-16">
      <div className="mb-8">
        <div className="animate-pulse bg-muted rounded-lg h-10 w-56" />
        <div className="animate-pulse bg-muted rounded h-4 w-80 mt-3" />
      </div>

      <div className="flex gap-8">
        {/* Sidebar skeleton */}
        <aside className="hidden md:block w-56 shrink-0 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-muted rounded h-6" />
          ))}
        </aside>

        {/* Grid skeleton */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-end mb-6">
            <div className="animate-pulse bg-muted rounded h-9 w-40" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="animate-pulse bg-muted rounded-xl aspect-square" />
                <div className="animate-pulse bg-muted rounded h-4 w-3/4" />
                <div className="animate-pulse bg-muted rounded h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
