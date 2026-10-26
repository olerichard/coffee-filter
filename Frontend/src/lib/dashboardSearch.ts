import { z } from 'zod';

export type DashboardView = 'brews' | 'bags';

export type DashboardPanel =
  | { kind: 'none' }
  | { kind: 'new-brew' }
  | { kind: 'edit-brew'; brewId: number }
  | { kind: 'new-bag' }
  | { kind: 'edit-bag'; coffeeBagId: number };

const dashboardBoolean = z
  .union([z.boolean(), z.stringbool()])
  .optional()
  .catch(undefined);

const dashboardSearchSchema = z.object({
  view: z.enum(['brews', 'bags']).optional().catch(undefined),
  showEmpty: dashboardBoolean,
  new: z.enum(['brew', 'bag']).optional().catch(undefined),
  brew: z.coerce.number().int().positive().optional().catch(undefined),
  bag: z.coerce.number().int().positive().optional().catch(undefined),
});

export type DashboardSearch = z.infer<typeof dashboardSearchSchema>;

export function validateDashboardSearch(
  search: Record<string, unknown>,
): DashboardSearch {
  const result = dashboardSearchSchema.safeParse(search);
  return result.success ? result.data : {};
}

export function getDashboardView(search: DashboardSearch): DashboardView {
  return search.view ?? 'brews';
}

export function getDashboardShowEmpty(search: DashboardSearch): boolean {
  return search.showEmpty ?? false;
}

export function getDashboardPanel(search: DashboardSearch): DashboardPanel {
  if (search.brew !== undefined) {
    return { kind: 'edit-brew', brewId: search.brew };
  }

  if (search.bag !== undefined) {
    return { kind: 'edit-bag', coffeeBagId: search.bag };
  }

  if (search.new === 'brew') {
    return { kind: 'new-brew' };
  }

  if (search.new === 'bag') {
    return { kind: 'new-bag' };
  }

  return { kind: 'none' };
}

const listState = (search: DashboardSearch) => ({
  view: search.view,
  showEmpty: search.showEmpty,
});

export function openNewBrew(search: DashboardSearch): DashboardSearch {
  return { ...listState(search), new: 'brew' };
}

export function openNewBag(search: DashboardSearch): DashboardSearch {
  return { ...listState(search), new: 'bag' };
}

export function openEditBrew(
  search: DashboardSearch,
  brewId: number,
): DashboardSearch {
  return { ...listState(search), brew: brewId };
}

export function openEditBag(
  search: DashboardSearch,
  coffeeBagId: number,
): DashboardSearch {
  return { ...listState(search), bag: coffeeBagId };
}

export function closeDashboardPanel(search: DashboardSearch): DashboardSearch {
  return listState(search);
}

export function setDashboardView(
  search: DashboardSearch,
  view: DashboardView,
): DashboardSearch {
  return {
    ...search,
    view: view === 'brews' ? undefined : view,
  };
}

export function setDashboardShowEmpty(
  search: DashboardSearch,
  showEmpty: boolean,
): DashboardSearch {
  return {
    ...search,
    showEmpty: showEmpty ? true : undefined,
  };
}
