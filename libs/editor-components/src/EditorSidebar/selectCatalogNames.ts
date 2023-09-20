import { AutocompleteName } from '@decipad/computer';

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
    ({ kind, type, name, blockId }) =>
      kind === 'variable' &&
      name &&
      blockId &&
      acceptableNumberCatalogKinds.has(type.kind)
  );
