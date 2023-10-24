import { AutocompleteName } from '@decipad/computer';
import { getDefined } from '@decipad/utils';
import { CatalogItemVar } from './types';

export const toVar = (
  name: AutocompleteName
): Omit<CatalogItemVar, 'currentTab'> => ({
  type: 'var',
  name: name.name,
  blockId: getDefined(name.blockId),
});
