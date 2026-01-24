import { brewClient } from '@/api/brews/brewClient';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  const query = useQuery({
    queryKey: ['brews'],
    queryFn: () => brewClient.getBrews(),
  });

  if (query.isLoading) return <div>Loading</div>;

  return (
    <div>
      {query.data?.map((b) => (
        <div>
          <div>{b.brewType}</div>
          <div>{b.outputTasteScore}</div>
          <div>{b.outputWeight}</div>
          <div>{b.outputTime}</div>
        </div>
      ))}
    </div>
  );
}
