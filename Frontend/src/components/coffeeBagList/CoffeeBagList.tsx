import { apiClients } from '@/api/apiClients';
import { useQuery } from '@tanstack/react-query';
import { CoffeeBagCard } from './CoffeeBagCard';

export const CoffeeBagList = () => {
  const query = useQuery({
    queryKey: ['coffeeBags'],
    queryFn: () => apiClients.coffeeBag.getCoffeeBags(),
  });

  if (query.isLoading) {
    return (
      <div className="flex justify-center py-8">
        <span className="text-muted-foreground">Loading coffee bags...</span>
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="flex justify-center py-8">
        <span className="text-destructive">Failed to load coffee bags</span>
      </div>
    );
  }

  const coffeeBags = query.data ?? [];

  if (coffeeBags.length === 0) {
    return (
      <div className="flex flex-col gap-4 py-8">
        <p className="text-muted-foreground text-sm">
          No coffee bags yet. Add your first coffee bag!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {coffeeBags.map((coffeeBag) => (
        <CoffeeBagCard key={coffeeBag.id} coffeeBag={coffeeBag} />
      ))}
    </div>
  );
};
