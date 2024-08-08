import type { Path } from 'slate';
import type { ELEMENT_H2, ELEMENT_H3 } from '@decipad/editor-types';

export type CatalogHeadingItem = {
  type: typeof ELEMENT_H2 | typeof ELEMENT_H3;
  name: string;
  blockId: string;
  path: Path;
  currentTab: boolean;
  dataTab: boolean;
};

export type CatalogItemVar = {
  type: 'var';
  name: string;
  blockId: string;
  currentTab: boolean;
  dataTab: boolean;
};

export type CatalogItem = CatalogHeadingItem | CatalogItemVar;

export type CatalogItems = CatalogItem[];

export type CatalogGroups = Record<string, CatalogItems>;
