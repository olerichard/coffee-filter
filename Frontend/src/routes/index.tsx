import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import type { Brew } from '@/api/brews/brewRequestSchemas';
import type { CoffeeBagWithUsage } from '@/api/coffeeBags/coffeeRequestSchemas';
import type { NewBrewOpenState } from '@/components/newBrew/NewBrewCard';
import { runViewTransition } from '@/lib/viewTransition';
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
  const [editingBrew, setEditingBrew] = useState<Brew | null>(null);
  const [editingCoffeeBag, setEditingCoffeeBag] =
    useState<CoffeeBagWithUsage | null>(null);
  const [open, setOpen] = useState<NewBrewOpenState>('none');

  const transitionOpenTo = (
    state: NewBrewOpenState,
    beforeUpdate?: () => void,
  ) => {
    if (state !== 'none' && window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    runViewTransition(() => {
      beforeUpdate?.();
      setOpen(state);
    });
  };

  const handleEditBrew = (brew: Brew) => {
    transitionOpenTo('brew', () => {
      setEditingBrew(brew);
      setEditingCoffeeBag(null);
    });
  };

  const handleEditCoffeeBag = (coffeeBag: CoffeeBagWithUsage) => {
    transitionOpenTo('bag', () => {
      setEditingCoffeeBag(coffeeBag);
      setEditingBrew(null);
    });
  };

  const handleEditEnd = () => {
    transitionOpenTo('none', () => {
      setEditingBrew(null);
      setEditingCoffeeBag(null);
    });
  };

  return (
    <div>
      <NewBrewCard
        open={open}
        onOpenChange={transitionOpenTo}
        editingBrew={editingBrew}
        editingCoffeeBag={editingCoffeeBag}
        onEditEnd={handleEditEnd}
      />
      <ListSection
        onEditBrew={handleEditBrew}
        onEditCoffeeBag={handleEditCoffeeBag}
      />
    </div>
  );
}

interface ListSectionProps {
  onEditBrew: (brew: Brew) => void;
  onEditCoffeeBag: (coffeeBag: CoffeeBagWithUsage) => void;
}

function ListSection({ onEditBrew, onEditCoffeeBag }: ListSectionProps) {
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
        <PreviousBrews onEdit={onEditBrew} />
      ) : (
        <CoffeeBagList showEmpty={showEmpty} onEdit={onEditCoffeeBag} />
      )}
    </div>
  );
}
