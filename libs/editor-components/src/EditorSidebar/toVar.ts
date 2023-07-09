import { AutocompleteName } from '@decipad/computer';
import { getDefined } from '@decipad/utils';
import { CatalogItemVar } from './types';

export const toVar = (name: AutocompleteName): CatalogItemVar => ({
  type: 'var',
  name: name.name,
  blockId: getDefined(name.blockId),
});
