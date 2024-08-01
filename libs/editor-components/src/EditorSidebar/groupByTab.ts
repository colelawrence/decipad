import type { CatalogGroups, CatalogItems } from './types';

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

const NOTEBOOK_VARIABLES = 'Notebook Variables';

export const groupByTab = (items: CatalogItems): CatalogGroups => {
  return items.reduce((acc, item) => {
    if (item.type === 'var' && item.dataTab) {
      if (!acc[NOTEBOOK_VARIABLES]) {
        acc[NOTEBOOK_VARIABLES] = [];
      }

      acc[NOTEBOOK_VARIABLES].push(item);
      return sortGroup(acc);
    }

    const tab = item.currentTab ? catalogGroups.current : catalogGroups.other;
    if (!acc[tab]) {
      acc[tab] = [];
    }
    acc[tab].push(item);
    return sortGroup(acc);
  }, {} as CatalogGroups);
};
