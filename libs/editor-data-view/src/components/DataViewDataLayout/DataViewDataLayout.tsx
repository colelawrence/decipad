import { FC, useMemo } from 'react';
import { Interpreter, Result, SerializedType } from '@decipad/computer';
import { DataViewRow } from '@decipad/ui';
import { AggregationKind, ValueCell } from '../../types';
import { DataViewHeader } from '..';
import { treeToTable } from '../../utils/treeToTable';
import { useDataViewLayoutData } from '../../hooks';
import { SmartCell } from '../SmartCell';
import { DataViewDataGroupElement } from '../DataViewDataGroup';

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
  collapsedGroups: string[] | undefined;
  onChangeCollapsedGroups: (collapsedGroups: string[]) => void;
  groupLength: number;
  index: number;
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
  subproperties: { value: Result.Comparable; name: string }[];
  alignRight?: boolean;
}

export interface DataViewLayoutProps {
  tableName: string;
  columnNames: string[];
  values: Interpreter.ResultTable;
  types: SerializedType[];
  aggregationTypes: Array<AggregationKind | undefined>;
  collapsedGroups: string[] | undefined;
  onChangeCollapsedGroups: (collapsedGroups: string[]) => void;
}

export const DataViewDataLayout: FC<DataViewLayoutProps> = ({
  tableName,
  columnNames,
  values,
  types,
  aggregationTypes,
  collapsedGroups,
  onChangeCollapsedGroups,
}: DataViewLayoutProps) => {
  const groups = useDataViewLayoutData(
    columnNames,
    values,
    types,
    aggregationTypes,
    collapsedGroups
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

  const cols = table.map((row) => {
    return row.reduce((previous, current) => {
      const colspan = current && current.colspan ? current.colspan : 0;
      return previous + colspan;
    }, 0);
  });

  const maxCols = Math.max(...cols);

  return (
    <>
      {table.map((row, index) => {
        return (
          <DataViewRow
            key={index}
            isFullWidth={row.length === maxCols}
            isBeforeFullWidthRow={
              table[index + 1] && table[index + 1].length === maxCols
            }
          >
            {row.map((element) => (
              <DataViewDataGroupElement
                key={index}
                index={index}
                tableName={tableName}
                element={element}
                aggregationType={aggregationTypes[element.columnIndex]}
                Header={DataViewHeader}
                SmartCell={SmartCell}
                isFullWidthRow={row.length === maxCols}
                collapsedGroups={collapsedGroups}
                onChangeCollapsedGroups={onChangeCollapsedGroups}
                groupLength={row.length}
              />
            ))}
          </DataViewRow>
        );
      })}
    </>
  );
};
