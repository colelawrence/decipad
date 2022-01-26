import { ComponentProps } from 'react';
import { organisms } from '@decipad/ui';

export type TableData = ComponentProps<typeof organisms.EditorTable>['value'];
export type TableColumn = TableData['columns'][0];
export type TableCellType = TableColumn['cellType'];
