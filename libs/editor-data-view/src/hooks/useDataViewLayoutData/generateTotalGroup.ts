import { Result, SerializedType } from '@decipad/computer';
import { zip } from '@decipad/utils';
import { AggregationKind, DataGroupElement } from '../../types';
import { generateSmartRow } from './generateSmartRow';

interface GenerateTotalGroupProps {
  columnNames: string[];
  columns: Result.ColumnLike<Result.Comparable>[];
  columnTypes: SerializedType[];
  aggregationTypes: (AggregationKind | undefined)[];
}

export const generateTotalGroup = ({
  columnNames,
  columns,
  columnTypes,
  aggregationTypes,
}: GenerateTotalGroupProps): DataGroupElement | undefined => {
  if (!aggregationTypes.some(Boolean)) {
    return undefined;
  }
  return {
    elementType: 'group',
    id: 'total',
    type: { kind: 'string' },
    value: 'Total' as Result.Comparable,
    children: [
      generateSmartRow({
        columns: zip(columnTypes.slice(1), columns.slice(1)),
        columnNames,
        columnIndex: 1,
        aggregationTypes,
        subProperties: [],
        global: true,
      }),
    ],
    collapsible: false,
    columnIndex: -1,
    global: true,
  };
};
