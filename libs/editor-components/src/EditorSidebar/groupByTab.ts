import { CatalogGroups, CatalogItems } from './types';

export const catalogGroups = {
  current: 'This tab',
  other: 'Other tabs',
};

const sortGroup = (obj: CatalogGroups): CatalogGroups => {
  const sortedEntries = Object.entries(obj).sort(([a], [b]) =>
    a === catalogGroups.current ? -1 : b === catalogGroups.current ? 1 : 0
  );

  return Object.fromEntries(sortedEntries);
};

export const groupByTab = (items: CatalogItems): CatalogGroups => {
  return items.reduce((acc, item) => {
    const tab = item.currentTab ? catalogGroups.current : catalogGroups.other;
    if (!acc[tab]) {
      acc[tab] = [];
    }
    acc[tab].push(item);
    return sortGroup(acc);
  }, {} as CatalogGroups);
};
