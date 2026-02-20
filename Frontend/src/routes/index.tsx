import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { PreviousBrews } from '@/components/brews/PreviousBrews';

export const Route = createFileRoute('/')({
  component: DashBoard,
});

function DashBoard() {
  const navigate = useNavigate();

  return (
    <div>
      <Button onClick={() => navigate({ to: '/brews/new' })}> New Brew </Button>
      <PreviousBrews />
    </div>
  );
}
