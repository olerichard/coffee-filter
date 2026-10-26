export const coffeeBagKeys = {
  all: ['coffeeBags'] as const,
  list: (includeEmpty: boolean) =>
    [...coffeeBagKeys.all, includeEmpty] as const,
  detail: (id: number) => [...coffeeBagKeys.all, 'detail', id] as const,
};
