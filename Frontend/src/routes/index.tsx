import { brewClient } from '@/api/brews/brewClient';
import { Brew } from '@/api/brews/brewRequestSchemas';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
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
      <div className="flex flex-col gap-2 max-w-80">
        {query.data?.map((b) => (
          <PreviousBrewCard key={b.id} brew={b} />
        ))}
      </div>
    </div>
  );
};

type PreviousBrewCardProps = {
  brew: Brew;
};

const PreviousBrewCard = (props: PreviousBrewCardProps) => {
  return (
    <Card>
      <div className={'pl-2'}>
        <CardTitle>{props.brew.coffeeBag.roaster}</CardTitle>
        <CardDescription>
          <div className="flex flex-col">
            <span>
              {props.brew.coffeeBag.roastStyle} {props.brew.coffeeBag.origin}
            </span>
          </div>
        </CardDescription>
        <CardContent>
          <div className="flex flex-col">
            <span>
              dose:{props.brew.coffeeDose}g time:{props.brew.brewTime}s, weight{' '}
              {props.brew.brewWeight}g
            </span>
            <span>
              <span className="text-6xl text-amber-600 ">
                {' '}
                {''.padStart(props.brew.brewTasteScore, '*')}
              </span>
              <span className="text-6xl">
                {''.padStart(5 - props.brew.brewTasteScore, '*')}
              </span>
            </span>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};
