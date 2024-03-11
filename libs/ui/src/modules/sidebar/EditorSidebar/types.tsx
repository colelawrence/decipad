import { ReactNode } from 'react';
import type { NumberCatalogItemType } from '../NumberCatalog/NumberCatalog';

export interface EditorSidebarProps {
  readonly items?: NumberCatalogItemType[];
  readonly children: ReactNode;
  readonly search: string;
  readonly setSearch: any;
  readonly sidebarOpen: boolean;
}

export type SelectedTab = 'variable' | 'block';
