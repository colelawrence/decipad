import { ReactNode } from 'react';
import { NumberCatalogItemType } from '../NumberCatalog/NumberCatalog';
import { NotebookMetaDataType } from '@decipad/react-contexts';

export type EditorSidebarProps = Readonly<{
  items?: NumberCatalogItemType[];
  children: ReactNode;
  search: string;
  setSearch: any;
}> &
  NotebookMetaDataType;

export type SelectedTab = 'variable' | 'block';
