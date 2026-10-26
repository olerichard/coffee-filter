import { useQuery } from '@tanstack/react-query';
import { PencilIcon } from 'lucide-react';
import type { Brew } from '@/api/brews/brewRequestSchemas';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClients } from '@/api/apiClients';
import { StarDisplay } from '@/components/ui/StarDisplay';

interface PreviousBrewsProps {
  onEdit: (brewId: number) => void;
}

export const PreviousBrews = ({ onEdit }: PreviousBrewsProps) => {
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
    console.log('error', query.error);
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
        <p className="text-muted-foreground text-sm">
          No brews yet. Start your first brew!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-1.5">
      <div className="flex flex-col gap-3">
        {brews.map((brew) => (
          <BrewCard key={brew.id} brew={brew} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
};

const BrewCard = ({
  brew,
  onEdit,
}: {
  brew: Brew;
  onEdit: (brewId: number) => void;
}) => {
  const formattedDate = new Date(brew.brewedOn).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card className="relative overflow-hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-2 right-2 z-10 rounded-full"
        onClick={() => onEdit(brew.id)}
        aria-label="Edit brew"
        title="Edit brew"
      >
        <PencilIcon />
      </Button>
      <CardContent className="py-0 px-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2 pr-10">
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{brew.coffeeBag.roaster}</p>
              <div className="flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground">
                <span>{brew.coffeeBag.origin}</span>
                {brew.coffeeBag.roastStyle && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <span>{brew.coffeeBag.roastStyle}</span>
                  </>
                )}
                {brew.coffeeBag.flavourNotes && (
                  <>
                    <span className="text-muted-foreground">·</span>
                    <span>{brew.coffeeBag.flavourNotes} </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="font-medium">{brew.brewMethodName}</span>
            <span className="text-muted-foreground">·</span>
            <span>{brew.coffeeDose}g</span>
            <span className="text-muted-foreground">·</span>
            <span>Grind {brew.grindSize}</span>
            <span className="text-muted-foreground">·</span>
            <span>{brew.brewTime}s</span>
            <span className="text-muted-foreground">·</span>
            <span>{brew.brewWeight}g</span>
          </div>

          <StarDisplay value={brew.brewTasteScore} />

          {brew.notes && (
            <div className="text-muted-foreground text-sm w-full min-w-0">
              <span className="whitespace-normal">{brew.notes}</span>
            </div>
          )}

          <p className="text-muted-foreground/50 text-sm text-right">
            {formattedDate}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
