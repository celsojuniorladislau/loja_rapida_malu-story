export function ProductGridSkeleton() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="h-5 w-32 bg-grey-200 animate-pulse rounded-md"/>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({length: 12}).map((_, i) => (
                    <div key={i}>
                        <div className="aspect-square bg-grey-200 animate-pulse rounded-md"/>
                        <div className="mt-2 space-y-1">
                            <div className="h-4 bg-grey-200 animate-pulse rounded-md w-3/4"/>
                            <div className="h-4 bg-grey-200 animate-pulse rounded-md w-1/3"/>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
