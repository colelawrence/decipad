import { debounceTime } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { ColumnLike, Comparable } from '@decipad/column';
import {
  RemoteComputer,
  Result,
  SerializedType,
} from '@decipad/remote-computer';
import { PreviousColumns } from '../types';
import { textify } from '@decipad/parse';
import { maybeAggregate } from './maybeAggregate';

export interface AggregateProps {
  computer: RemoteComputer;
  tableName?: string;
  aggregationType?: string;
  column?: {
    type: SerializedType;
    value: ColumnLike<Comparable>;
    name: string;
  };
  previousColumns: PreviousColumns;
  roundings: Array<string | undefined>;
}

export interface AggregationResult {
  result: Result.Result;
  expression?: string | Error;
}

const DEBOUNCE_RESULT_MS = 100;

export const aggregate = ({
  computer,
  tableName,
  aggregationType,
  column,
  previousColumns,
  roundings,
}: AggregateProps): Promise<AggregationResult> => {
  return new Promise((resolve) => {
    const expressionFilter =
      (column &&
        previousColumns.reduce((previous, current, index) => {
          const rounding = roundings[index];
          const filterSubject = previous
            ? `${previous}.${current.name}`
            : `${tableName}.${current.name}`;
          const roundedFilterSubject = rounding
            ? `round(${filterSubject}, ${rounding})`
            : filterSubject;
          const escapedValue = textify({
            type: current.type,
            value: current.value as Result.Result['value'],
          });
          return previous === ''
            ? `filter(${tableName}, ${roundedFilterSubject} == ${escapedValue})`
            : `filter(${previous}, ${roundedFilterSubject} == ${escapedValue})`;
        }, '')) ||
      tableName;

    const expression =
      column &&
      expressionFilter &&
      maybeAggregate(
        `${expressionFilter}.${column.name}`,
        column.type,
        aggregationType,
        {
          sum: `sum(${tableName}.${column.name})`,
        }
      );

    const sub = (
      (typeof expression === 'string' &&
        expression &&
        computer
          .expressionResultFromText$(expression)
          .pipe(debounceTime(DEBOUNCE_RESULT_MS))) ||
      EMPTY
    ).subscribe((result) => {
      sub.unsubscribe();
      resolve({ result, expression });
    });
  });
};
