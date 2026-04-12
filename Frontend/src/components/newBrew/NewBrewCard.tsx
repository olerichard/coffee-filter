import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClients } from '@/api/apiClients';
import { CreateBrewForm } from './CreateBrewForm';

export function NewBrewCard() {
  const coffeeBagsQuery = useQuery({
    queryKey: ['coffeeBags'],
    queryFn: () => apiClients.coffeeBag.getCoffeeBags(),
  });

  const isLoading = coffeeBagsQuery.isLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Brew</CardTitle>
      </CardHeader>
      <CardContent>
        <CreateBrewForm
          coffeeBags={coffeeBagsQuery.data ?? []}
          isLoading={isLoading}
          onCancel={() => {}}
        />
      </CardContent>
    </Card>
  );
}
