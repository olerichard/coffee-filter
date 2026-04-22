import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
  const [showEmpty, setShowEmpty] = useState(false);

  return (
    <div className="flex flex-col gap-4 py-1.5 px-4 sm:px-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select
            value={view}
            onValueChange={(value) => setView(value as 'brews' | 'coffeeBags')}
          >
            <SelectTrigger className="w-45">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brews">Previous Brews</SelectItem>
              <SelectItem value="coffeeBags">Coffee Bags</SelectItem>
            </SelectContent>
          </Select>

          {view === 'coffeeBags' && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="showEmpty"
                checked={showEmpty}
                onCheckedChange={(checked) => setShowEmpty(checked as boolean)}
              />
              <Label htmlFor="showEmpty" className="text-sm cursor-pointer">
                Show empty
              </Label>
            </div>
          )}
        </div>
      </div>

      {view === 'brews' ? (
        <PreviousBrews />
      ) : (
        <CoffeeBagList showEmpty={showEmpty} />
      )}
    </div>
  );
}
