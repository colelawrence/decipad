import type { AutocompleteName } from '@decipad/language-interfaces';

export const acceptableNumberCatalogKinds = new Set([
  'boolean',
  'date',
  'number',
  'string',
  'range',
  'table',
  'column',
]);

export const selectCatalogNames = (
  items: AutocompleteName[]
): Array<AutocompleteName> =>
  items.filter(
    ({ autocompleteGroup, kind, name, blockId }) =>
      autocompleteGroup === 'variable' &&
      name &&
      blockId &&
      acceptableNumberCatalogKinds.has(kind)
  );
