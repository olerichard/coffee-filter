import { createFileRoute } from '@tanstack/react-router';
import { NewBrewCard } from '@/components/newBrew/NewBrewCard';
import { PreviousBrews } from '@/components/brews/PreviousBrews';

export const Route = createFileRoute('/')({
  component: DashBoard,
});

function DashBoard() {
  return (
    <div>
      <NewBrewCard />
      <PreviousBrews />
    </div>
  );
}
