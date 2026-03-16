import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClients } from '@/api/apiClients';
import { CreateBrewForm } from './-components/CreateBrewForm';

export const Route = createFileRoute('/brews/new')({
  component: NewBrewPage,
});

function NewBrewPage() {
  const navigate = useNavigate();

  const coffeeBagsQuery = useQuery({
    queryKey: ['coffeeBags'],
    queryFn: () => apiClients.coffeeBag.getCoffeeBags(),
  });

  const isLoading = coffeeBagsQuery.isLoading;

  return (
    <div className="max-w-2xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>New Brew</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateBrewForm
            coffeeBags={coffeeBagsQuery.data ?? []}
            isLoading={isLoading}
            onCancel={() => navigate({ to: '/' })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
