import { Result, SerializedType } from '@decipad/computer';
import { BehaviorSubject } from 'rxjs';
import { AggregationKind, DataGroup } from '../../types';

type SmartColumnInput = [SerializedType, Result.ColumnLike<Result.Comparable>];

export interface GenerateSmartRowProps {
  columns: SmartColumnInput[];
  columnNames: string[];
  columnIndex: number;
  aggregationTypes: (AggregationKind | undefined)[];
  subProperties: {
    type: SerializedType;
    value: Result.Comparable;
    name: string;
  }[];
  parentHighlight$?: BehaviorSubject<boolean>;
  global?: boolean;
}

export const generateSmartRow = ({
  columns,
  columnNames,
  columnIndex,
  aggregationTypes,
  subProperties,
  parentHighlight$,
  global = false,
}: GenerateSmartRowProps): DataGroup => {
  const [firstColumn, ...rest] = columns;

  return {
    elementType: 'smartrow',
    children:
      rest.length > 0 && columnIndex + 1 < columnNames.length
        ? [
            generateSmartRow({
              columns: rest,
              columnNames,
              columnIndex: columnIndex + 1,
              aggregationTypes,
              subProperties,
              parentHighlight$,
              global,
            }),
          ]
        : [],
    column: firstColumn && {
      name: columnNames[columnIndex],
      type: firstColumn[0],
      value: firstColumn[1],
    },
    columnIndex,
    subProperties,
    parentHighlight$,
    global,
  };
};
