import { FC, useMemo } from 'react';
import { Result, SerializedType } from '@decipad/computer';
import { DataViewRow } from '@decipad/ui';
import {
  AggregationKind,
  Column,
  PreviousColumns,
  ValueCell,
} from '../../types';
import { treeToTable } from '../../utils/treeToTable';
import { useDataViewLayoutData } from '../../hooks';
import { DataViewDataGroupElement } from '../DataViewDataGroup';
import { DataViewHeader } from '..';
import { SmartCell } from '../SmartCell';

export interface HeaderProps {
  type?: SerializedType;
  value?: ValueCell;
  rowSpan?: number;
  colSpan?: number;
  collapsible?: boolean;
  onHover: (hover: boolean) => void;
  hover: boolean;
  alignRight?: boolean;
  isFullWidthRow: boolean;
  groupId: string;
  expandedGroups: string[] | undefined;
  onChangeExpandedGroups: (expandedGroups: string[]) => void;
  groupLength: number;
  index: number;
  global?: boolean;
}

export interface SmartProps {
  tableName: string;
  column: {
    type: SerializedType;
    value: Result.ColumnLike<Result.Comparable>;
    name: string;
  };
  columnIndex?: number;
  aggregationType: AggregationKind | undefined;
  rowSpan?: number;
  colSpan?: number;
  onHover: (hover: boolean) => void;
  hover: boolean;
  previousColumns: PreviousColumns;
  alignRight?: boolean;
  global?: boolean;
}

export interface DataViewLayoutProps {
  tableName: string;
  columns: Column[];
  aggregationTypes: Array<AggregationKind | undefined>;
  expandedGroups: string[] | undefined;
  onChangeExpandedGroups: (expandedGroups: string[]) => void;
}

export const DataViewDataLayout: FC<DataViewLayoutProps> = ({
  tableName,
  columns,
  aggregationTypes,
  expandedGroups = [],
  onChangeExpandedGroups,
}: DataViewLayoutProps) => {
  const groups = useDataViewLayoutData(
    columns,
    aggregationTypes,
    expandedGroups
  );

  const table = useMemo(
    () =>
      treeToTable({
        elementType: 'group',
        children: groups,
        columnIndex: -1,
      }),
    [groups]
  );

  const cols = useMemo(
    () =>
      table.map((row) => {
        return row.reduce((previous, current) => {
          const colspan = current && current.colspan ? current.colspan : 0;
          return previous + colspan;
        }, 0);
      }),
    [table]
  );

  const maxCols = Math.max(...cols);

  return (
    <>
      {table.map((row, index) => {
        return (
          <DataViewRow
            key={`${table.indexOf(row)}-${index}}`}
            isFullWidth={row.length === maxCols}
            isBeforeFullWidthRow={
              table[index + 1] && table[index + 1].length === maxCols
            }
            global={row.some((r) => r.global)}
          >
            {row.map((element, elementIndex) => (
              <DataViewDataGroupElement
                key={`${table.indexOf(row)}-${index}-${elementIndex}}`}
                index={index}
                tableName={tableName}
                element={element}
                aggregationType={aggregationTypes[element.columnIndex]}
                Header={DataViewHeader}
                SmartCell={SmartCell}
                isFullWidthRow={row.length === maxCols}
                expandedGroups={expandedGroups}
                onChangeExpandedGroups={onChangeExpandedGroups}
                groupLength={row.length}
              />
            ))}
          </DataViewRow>
        );
      })}
    </>
  );
};
