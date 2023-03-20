import { FC, ReactNode, useMemo } from 'react';
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
import { DataViewTableHeader } from '..';
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
  rotate: boolean;
  isFirstLevelHeader: boolean;
}

export interface SmartProps {
  tableName: string;
  column: {
    type: SerializedType;
    value: Result.ColumnLike<Result.Comparable>;
    name: string;
  };
  roundings: Array<string | undefined>;
  columnIndex?: number;
  aggregationType: AggregationKind | undefined;
  rowSpan?: number;
  colSpan?: number;
  onHover: (hover: boolean) => void;
  hover: boolean;
  previousColumns: PreviousColumns;
  alignRight?: boolean;
  global?: boolean;
  rotate: boolean;
}

export interface DataViewLayoutProps {
  tableName: string;
  columns: Column[];
  aggregationTypes: Array<AggregationKind | undefined>;
  roundings: Array<string | undefined>;
  expandedGroups: string[] | undefined;
  onChangeExpandedGroups: (expandedGroups: string[]) => void;
  rotate: boolean;
  headers: ReactNode[];
}

export const DataViewDataLayout: FC<DataViewLayoutProps> = ({
  tableName,
  columns,
  aggregationTypes,
  roundings,
  expandedGroups = [],
  onChangeExpandedGroups,
  rotate,
  headers,
}: DataViewLayoutProps) => {
  const groups = useDataViewLayoutData({
    tableName,
    columns,
    aggregationTypes,
    roundings,
    expandedGroups,
    includeTotal: true,
    preventExpansion: rotate,
    rotate,
  });

  const table = useMemo(
    () =>
      treeToTable(
        {
          elementType: 'group',
          children: groups,
          columnIndex: -1,
        },
        {
          rotate,
        }
      ),
    [groups, rotate]
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
            rotate={rotate}
          >
            {rotate && headers[index]}
            {row.map((element, elementIndex) => (
              <DataViewDataGroupElement
                key={`${table.indexOf(row)}-${index}-${elementIndex}}`}
                index={index}
                tableName={tableName}
                element={element}
                roundings={roundings}
                aggregationType={aggregationTypes[element.columnIndex]}
                Header={DataViewTableHeader}
                SmartCell={SmartCell}
                isFullWidthRow={row.length === maxCols}
                expandedGroups={expandedGroups}
                onChangeExpandedGroups={onChangeExpandedGroups}
                groupLength={row.length}
                rotate={rotate}
                isFirstLevel={index === 0}
              />
            ))}
          </DataViewRow>
        );
      })}
    </>
  );
};
