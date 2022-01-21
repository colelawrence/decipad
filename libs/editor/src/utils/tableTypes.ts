import { ComponentProps } from 'react';
import { EditorTable } from 'libs/ui/src/organisms';

export type TableData = ComponentProps<typeof EditorTable>['value'];
export type TableColumn = TableData['columns'][0];
export type TableCellType = TableColumn['cellType'];
