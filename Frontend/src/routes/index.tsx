import { createFileRoute, useNavigate } from '@tanstack/react-router';
import type { DashboardSearch, DashboardView } from '@/lib/dashboardSearch';
import {
  closeDashboardPanel,
  getDashboardPanel,
  getDashboardShowEmpty,
  getDashboardView,
  openEditBag,
  openEditBrew,
  openNewBag,
  openNewBrew,
  setDashboardShowEmpty,
  setDashboardView,
  validateDashboardSearch,
} from '@/lib/dashboardSearch';
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
  validateSearch: validateDashboardSearch,
  component: DashBoard,
});

function DashBoard() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const panel = getDashboardPanel(search);
  const view = getDashboardView(search);
  const showEmpty = getDashboardShowEmpty(search);

  const updateSearch = (
    updater: (current: DashboardSearch) => DashboardSearch,
    scrollToTop = false,
  ) => {
    if (scrollToTop && window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    runViewTransition(() => {
      void navigate({ search: updater, replace: true });
    });
  };

  const handleOpenNewBrew = () => updateSearch(openNewBrew, true);
  const handleOpenNewBag = () => updateSearch(openNewBag, true);
  const handleClosePanel = () => updateSearch(closeDashboardPanel);

  const handleEditBrew = (brewId: number) => {
    updateSearch((current) => openEditBrew(current, brewId), true);
  };

  const handleEditCoffeeBag = (coffeeBagId: number) => {
    updateSearch((current) => openEditBag(current, coffeeBagId), true);
  };

  const handleViewChange = (nextView: DashboardView) => {
    updateSearch((current) => setDashboardView(current, nextView));
  };

  const handleShowEmptyChange = (nextShowEmpty: boolean) => {
    updateSearch((current) => setDashboardShowEmpty(current, nextShowEmpty));
  };

  return (
    <div>
      <NewBrewCard
        panel={panel}
        onOpenNewBrew={handleOpenNewBrew}
        onOpenNewBag={handleOpenNewBag}
        onClose={handleClosePanel}
      />
      <ListSection
        view={view}
        showEmpty={showEmpty}
        onViewChange={handleViewChange}
        onShowEmptyChange={handleShowEmptyChange}
        onEditBrew={handleEditBrew}
        onEditCoffeeBag={handleEditCoffeeBag}
      />
    </div>
  );
}

interface ListSectionProps {
  view: DashboardView;
  showEmpty: boolean;
  onViewChange: (view: DashboardView) => void;
  onShowEmptyChange: (showEmpty: boolean) => void;
  onEditBrew: (brewId: number) => void;
  onEditCoffeeBag: (coffeeBagId: number) => void;
}

function ListSection({
  view,
  showEmpty,
  onViewChange,
  onShowEmptyChange,
  onEditBrew,
  onEditCoffeeBag,
}: ListSectionProps) {
  return (
    <div className="flex flex-col gap-4 py-1.5 px-4 sm:px-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select
            value={view}
            onValueChange={(value) => onViewChange(value as DashboardView)}
          >
            <SelectTrigger className="w-45">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="brews">Previous Brews</SelectItem>
              <SelectItem value="bags">Coffee Bags</SelectItem>
            </SelectContent>
          </Select>

          {view === 'bags' && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="showEmpty"
                checked={showEmpty}
                onCheckedChange={(checked) =>
                  onShowEmptyChange(checked === true)
                }
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
