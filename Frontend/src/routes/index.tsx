import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { PreviousBrews } from '@/components/brews/PreviousBrews';

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
