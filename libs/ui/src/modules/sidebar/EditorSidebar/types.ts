import { ReactNode } from 'react';
import { NumberCatalogItemType } from '../NumberCatalog/NumberCatalog';
import { NotebookMetaDataType } from '@decipad/react-contexts';
import { EditorSidebarTab } from '@decipad/editor-types';

export type EditorSidebarProps = Readonly<{
  selectedTab: EditorSidebarTab;
  // False positive
  // eslint-disable-next-line unused-imports/no-unused-vars
  onSelectTab: (tab: EditorSidebarTab) => void;
  items?: NumberCatalogItemType[];
  children: [ReactNode, ReactNode, ReactNode];
  search: string;
  setSearch: any;
}> &
  NotebookMetaDataType;
