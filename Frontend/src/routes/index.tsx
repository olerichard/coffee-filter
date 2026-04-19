import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NewBrewCard } from '@/components/newBrew/NewBrewCard';
import { PreviousBrews } from '@/components/brews/PreviousBrews';
import { CoffeeBagList } from '@/components/coffeeBagList/CoffeeBagList';

export const Route = createFileRoute('/')({
  component: DashBoard,
});

function DashBoard() {
  return (
    <div>
      <NewBrewCard />
      <ListSection />
    </div>
  );
}

function ListSection() {
  const [view, setView] = useState<'brews' | 'coffeeBags'>('brews');

  return (
    <div className="flex flex-col gap-4 py-1.5 px-4 sm:px-0">
      <div className="flex items-center justify-between">
        <Select
          value={view}
          onValueChange={(value) => setView(value as 'brews' | 'coffeeBags')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="brews">Previous Brews</SelectItem>
            <SelectItem value="coffeeBags">Coffee Bags</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {view === 'brews' ? <PreviousBrews /> : <CoffeeBagList />}
    </div>
  );
}
