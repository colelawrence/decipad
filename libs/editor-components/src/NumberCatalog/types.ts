import { ComponentProps } from 'react';
import { NumberCatalog as UINumberCatalog } from '@decipad/ui';

export type CatalogItemsReturnType = ComponentProps<
  typeof UINumberCatalog
>['items'];

export type CatalogItemVar = CatalogItemsReturnType[number] & { type: 'var' };
