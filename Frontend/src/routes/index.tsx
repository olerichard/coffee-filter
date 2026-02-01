import { brewClient } from '@/api/brews/brewClient';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: DashBoard,
});

function DashBoard() {
  return (
    <div>
      <Button> New Brew </Button>
      <PreviousBrews />
    </div>
  );
}

const PreviousBrews = () => {
  const query = useQuery({
    queryKey: ['brews'],
    queryFn: () => brewClient.getBrews(),
  });

  if (query.isLoading) return <div>Loading</div>;

  return (
    <div>
      <span>Previous Brews</span>
      {query.data?.map((b) => (
        <div>
          <div>{b.brewType}</div>
          <div>{b.brewTasteScore}</div>
          <div>{b.brewWeight}</div>
          <div>{b.brewTime}</div>
        </div>
      ))}
    </div>
  );
};
