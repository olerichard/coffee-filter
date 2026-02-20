import { useQuery } from '@tanstack/react-query';
import type { Brew } from '@/api/brews/brewRequestSchemas';
import { Card, CardContent } from '@/components/ui/card';
import { apiClients } from '@/api/apiClients';

export function PreviousBrews() {
  const query = useQuery({
    queryKey: ['brews'],
    queryFn: () => apiClients.brew.getBrews(),
  });

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-8">
        <span className="text-muted-foreground">Loading brews...</span>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="flex justify-center py-8">
        <span className="text-destructive">Failed to load brews</span>
      </div>
    );
  }

  const brews = query.data ?? [];

  if (brews.length === 0) {
    return (
      <div className="flex flex-col gap-4 py-8">
        <h2 className="text-xl font-semibold">Previous Brews</h2>
        <p className="text-muted-foreground text-sm">
          No brews yet. Start your first brew!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4">
      <h2 className="text-xl font-semibold">Previous Brews</h2>
      <div className="flex flex-col gap-3">
        {brews.map((brew) => (
          <BrewCard key={brew.id} brew={brew} />
        ))}
      </div>
    </div>
  );
}

function BrewCard({ brew }: { brew: Brew }) {
  const formattedDate = new Date(brew.brewedOn).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{brew.coffeeBag.roaster}</p>
              <p className="text-muted-foreground text-sm truncate">
                {brew.coffeeBag.origin}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <span className="text-amber-500">★</span>
              <span className="text-sm font-medium">
                {brew.brewTasteScore}/10
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="font-medium">{brew.brewType}</span>
            <span className="text-muted-foreground">·</span>
            <span>{brew.coffeeDose}g</span>
            <span className="text-muted-foreground">·</span>
            <span>Grind {brew.grindSize}</span>
            <span className="text-muted-foreground">·</span>
            <span>{brew.brewTime}s</span>
            <span className="text-muted-foreground">·</span>
            <span>{brew.brewWeight}g</span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-muted-foreground text-sm">{formattedDate}</p>
            {brew.notes && (
              <p className="text-muted-foreground text-sm truncate max-w-[60%]">
                {brew.notes}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
