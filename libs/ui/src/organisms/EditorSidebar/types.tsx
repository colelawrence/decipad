import { ReactNode } from 'react';
import { NumberCatalogItemType } from '../NumberCatalog/NumberCatalog';

export interface EditorSidebarProps {
  readonly items?: NumberCatalogItemType[];
  readonly children: ReactNode;
  readonly search: string;
  readonly setSearch: any;
  readonly sidebarTab: SelectedTab;
  readonly setSidebarTab: any;
  readonly sidebarOpen: boolean;
  readonly setSidebarOpen: any;
}

export type SelectedTab = 'variable' | 'block';
