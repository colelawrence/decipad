import { ElementKind } from '@decipad/editor-types';
import type { AutocompleteName } from '@decipad/language-interfaces';
import { getDefined } from '@decipad/utils';
import type { CatalogItemVar } from './types';

export const toVar = (
  name: AutocompleteName
): Omit<CatalogItemVar, 'currentTab'> => ({
  type: 'var',
  name: name.name,
  blockId: getDefined(name.blockId),
  dataTab: false,
  isSelected: false,
  blockType: name.blockType as ElementKind,
  autocompleteGroup: name.autocompleteGroup,
  integrationProvider: name.integrationProvider,
});
