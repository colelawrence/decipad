import type { Path } from 'slate';
import type {
  ElementKind,
  ELEMENT_H2,
  ELEMENT_H3,
  ImportElementSource,
} from '@decipad/editor-types';

export type CatalogHeadingItem = {
  type: typeof ELEMENT_H2 | typeof ELEMENT_H3;
  name: string;
  blockId: string;
  path: Path;
  currentTab: boolean;
  dataTab: boolean;
  isSelected?: boolean;
};

export type CatalogItemVar = {
  type: 'var';
  name: string;
  blockId: string;
  currentTab: boolean;
  dataTab: boolean;
  isSelected?: boolean;
  blockType?: ElementKind;
  autocompleteGroup?: string;
  integrationProvider?: ImportElementSource;
};

export type CatalogItem = CatalogHeadingItem | CatalogItemVar;

export type CatalogItems = CatalogItem[];

export type CatalogGroups = Record<string, CatalogItems>;
