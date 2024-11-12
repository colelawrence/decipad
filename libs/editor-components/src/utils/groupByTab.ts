import {
  ElementKind,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_DATA_TAB_CHILDREN,
  ELEMENT_INTEGRATION,
  ELEMENT_VARIABLE_DEF,
  ELEMENT_DATA_TAB_WORKSPACE_RESULT,
  ELEMENT_TABLE,
  ELEMENT_METRIC,
} from '@decipad/editor-types';
import { isFlagEnabled } from '@decipad/feature-flags';
import find from 'lodash/find';
import type { CatalogGroups, CatalogItems } from './types';

export const legacyCatalogGroups = {
  current: 'This tab',
  other: 'Other tabs',
};

export const catalogGroups: Record<
  string,
  { name: string; validBlockTypes: ElementKind[] }
> = {
  variables: {
    name: 'Variables',
    validBlockTypes: [
      ELEMENT_DATA_TAB_CHILDREN,
      ELEMENT_DATA_TAB_WORKSPACE_RESULT,
      ELEMENT_CODE_LINE_V2,
      ELEMENT_CODE_LINE_V2,
      ELEMENT_CODE_LINE,
      ELEMENT_TABLE,
    ],
  },
  widgets: {
    name: 'Widgets',
    validBlockTypes: [ELEMENT_VARIABLE_DEF, ELEMENT_METRIC],
  },
  queries: {
    name: 'Datasets',
    validBlockTypes: [ELEMENT_INTEGRATION],
  },
};

const sortGroup = (obj: CatalogGroups): CatalogGroups => {
  const sortedEntries = Object.entries(obj).sort(([a], [b]) =>
    a === legacyCatalogGroups.current
      ? -1
      : b === legacyCatalogGroups.current
      ? 1
      : 0
  );

  return Object.fromEntries(sortedEntries);
};

const NOTEBOOK_VARIABLES = 'Notebook Variables';

export const groupByTab = (items: CatalogItems): CatalogGroups => {
  return items.reduce<CatalogGroups>((acc, item) => {
    if (isFlagEnabled('NAV_SIDEBAR')) {
      if (item.type === 'var') {
        const groupName = find(Object.values(catalogGroups), (cg) =>
          cg.validBlockTypes.includes(item.blockType ?? ELEMENT_VARIABLE_DEF)
        )?.name;

        if (groupName) {
          if (!acc[groupName]) {
            acc[groupName] = [];
          }

          acc[groupName].push(item);
        }
      }
      return sortGroup(acc);
    }

    if (item.type === 'var' && item.dataTab) {
      if (!acc[NOTEBOOK_VARIABLES]) {
        acc[NOTEBOOK_VARIABLES] = [];
      }

      acc[NOTEBOOK_VARIABLES].push(item);
      return sortGroup(acc);
    }

    const tab = item.currentTab
      ? legacyCatalogGroups.current
      : legacyCatalogGroups.other;
    if (!acc[tab]) {
      acc[tab] = [];
    }
    acc[tab].push(item);
    return sortGroup(acc);
  }, {});
};
