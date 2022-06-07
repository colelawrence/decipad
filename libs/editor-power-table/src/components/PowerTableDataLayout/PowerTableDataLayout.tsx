import { FC, useMemo } from 'react';
import { Interpreter, Result, SerializedType } from '@decipad/computer';
import { molecules } from '@decipad/ui';
import { AggregationKind, ValueCell } from '../../types';
import { PowerHeader } from '..';
import { treeToTable } from '../../utils/treeToTable';
import { usePowerTableLayoutData } from '../../hooks';
import { SmartCell } from '../SmartCell';
import { PowerTableDataGroup } from '../PowerTableDataGroup';

export interface HeaderProps {
  type?: SerializedType;
  value?: ValueCell;
  rowSpan?: number;
  colSpan?: number;
  onHover: (hover: boolean) => void;
  hover: boolean;
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
}

export interface PowerTableLayoutProps {
  values: Interpreter.ResultTable;
  types: SerializedType[];
  aggregationTypes: Array<AggregationKind | undefined>;
}

export const PowerTableDataLayout: FC<PowerTableLayoutProps> = ({
  values,
  types,
  aggregationTypes,
}: PowerTableLayoutProps) => {
  const groups = usePowerTableLayoutData(values, types);
  const table = useMemo(
    () =>
      treeToTable({
        elementType: 'group',
        children: groups,
        columnIndex: -1,
      }),
    [groups]
  );
  return (
    <>
      {table.map((row, index) => (
        <molecules.PowerTableRow key={index}>
          <PowerTableDataGroup
            key={index}
            group={row}
            Header={PowerHeader}
            SmartCell={SmartCell}
            selectedAggregationTypes={aggregationTypes}
          />
        </molecules.PowerTableRow>
      ))}
    </>
  );
};
