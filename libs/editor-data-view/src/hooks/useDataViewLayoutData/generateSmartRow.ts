import { BehaviorSubject } from 'rxjs';
import {
  AggregationKind,
  DataGroup,
  PreviousColumns,
  VirtualColumn,
} from '../../types';

export interface GenerateSmartRowProps {
  columns: VirtualColumn[];
  columnIndex: number;
  aggregationTypes: (AggregationKind | undefined)[];
  previousColumns: PreviousColumns;
  parentHighlight$?: BehaviorSubject<boolean>;
  global?: boolean;
  rotate: boolean;
}

export const generateSmartRow = ({
  columns,
  columnIndex,
  aggregationTypes,
  previousColumns,
  parentHighlight$,
  global = false,
  rotate,
}: GenerateSmartRowProps): DataGroup => {
  const [firstColumn, ...rest] = columns;

  return {
    elementType: 'smartrow',
    children:
      rest.length > 0
        ? [
            generateSmartRow({
              columns: rest,
              columnIndex: columnIndex + 1,
              aggregationTypes,
              previousColumns,
              parentHighlight$,
              global,
              rotate,
            }),
          ]
        : [],
    column: firstColumn,
    columnIndex,
    previousColumns,
    parentHighlight$,
    global,
  };
};
