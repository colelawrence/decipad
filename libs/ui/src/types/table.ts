import { TableColumn } from '@decipad/editor-types';

export interface Column {
  name: string;
  cellType: TableColumn['cellType'];
}
