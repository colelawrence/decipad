import { Path } from 'slate';
import { ELEMENT_H2, ELEMENT_H3 } from '@udecode/plate';

export type CatalogHeadingItem = {
  type: typeof ELEMENT_H2 | typeof ELEMENT_H3;
  name: string;
  blockId: string;
  path: Path;
};

export type CatalogItemVar = {
  type: 'var';
  name: string;
  blockId: string;
};

export type CatalogItem = CatalogHeadingItem | CatalogItemVar;

export type CatalogItems = CatalogItem[];
