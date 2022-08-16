import { FC, useMemo } from 'react';
import { Interpreter, Result, SerializedType } from '@decipad/computer';
import { molecules } from '@decipad/ui';
import { AggregationKind, ValueCell } from '../../types';
import { DataViewHeader } from '..';
import { treeToTable } from '../../utils/treeToTable';
import { useDataViewLayoutData } from '../../hooks';
import { SmartCell } from '../SmartCell';
import { DataViewDataGroup } from '../DataViewDataGroup';

export interface HeaderProps {
  type?: SerializedType;
  value?: ValueCell;
  rowSpan?: number;
  colSpan?: number;
  onHover: (hover: boolean) => void;
  hover: boolean;
  alignRight?: boolean;
}

export interface SmartProps {
  column: {
    type: SerializedType;
    value: Result.ColumnLike<Result.Comparable>;
  };
  columnIndex?: number;
  aggregationType: AggregationKind | undefined;
  rowSpan?: number;
  colSpan?: number;
  onHover: (hover: boolean) => void;
  hover: boolean;
  alignRight?: boolean;
}

export interface DataViewLayoutProps {
  values: Interpreter.ResultTable;
  types: SerializedType[];
  aggregationTypes: Array<AggregationKind | undefined>;
}

export const DataViewDataLayout: FC<DataViewLayoutProps> = ({
  values,
  types,
  aggregationTypes,
}: DataViewLayoutProps) => {
  const groups = useDataViewLayoutData(values, types);
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
      {table.map((row, index) => (
        <molecules.DataViewRow
          key={index}
          isFullWidth={row.length === maxCols}
          isBeforeFullWidthRow={
            table[index + 1] && table[index + 1].length === maxCols
          }
        >
          <DataViewDataGroup
            key={index}
            group={row}
            Header={DataViewHeader}
            SmartCell={SmartCell}
            selectedAggregationTypes={aggregationTypes}
          />
        </molecules.DataViewRow>
      ))}
    </>
  );
};
