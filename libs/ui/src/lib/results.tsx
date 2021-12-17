import { Result, SerializedType, SerializedTypeKind } from '@decipad/language';
import { DateResult, NumberResult, TimeUnitsResult } from '../atoms';
import { InlineCodeError } from '../molecules';
import {
  ColumnResult,
  InlineColumnResult,
  RangeResult,
  TableResult,
} from '../organisms';

export type Variant = 'block' | 'inline';

export interface ResultProps<T extends SerializedTypeKind> extends Result<T> {
  readonly parentType?: SerializedType;
  readonly variant?: Variant;
}

export type ResultComponent<T extends SerializedTypeKind> = (
  props: ResultProps<T>
) => ReturnType<React.FC>;
interface ResultMatcher {
  component: Partial<ResultComponent<SerializedTypeKind>>;
  match: <T extends SerializedTypeKind>(props: ResultProps<T>) => boolean;
}

export interface Statement {
  displayInline: boolean;
  endLine: number;
  startLine: number;
  result: Result;
}

export const DefaultResult = ({
  value,
}: ResultProps<SerializedTypeKind>): ReturnType<React.FC> => (
  <span>{String(value ?? '')}</span>
);
export const FunctionResult = () => <span>ƒ</span>;
export const InlineTableResult = () => <span>Table</span>;

export function getResultComponent<T extends SerializedTypeKind>(
  props: ResultProps<T>
): ResultComponent<T> {
  // Result types are declared here to avoid dependency cycles of result components also importing
  // this file.
  const resultTypes: ResultMatcher[] = [
    {
      component: NumberResult,
      match: ({ type }) => type.kind === 'number',
    },
    {
      component: DateResult,
      match: ({ type }) => type.kind === 'date',
    },
    {
      component: TableResult,
      match: ({ type, variant }) =>
        type.kind === 'table' && variant === 'block',
    },
    {
      component: InlineTableResult,
      match: ({ type, variant }) =>
        type.kind === 'table' && variant === 'inline',
    },
    {
      component: ColumnResult,
      match: ({ type, variant }) =>
        type.kind === 'column' && variant === 'block',
    },
    {
      component: InlineColumnResult,
      match: ({ type, variant }) =>
        type.kind === 'column' && variant === 'inline',
    },
    {
      component: FunctionResult,
      match: ({ type }) => type.kind === 'function',
    },
    {
      component: TimeUnitsResult,
      match: ({ type }) => type.kind === 'time-quantity',
    },
    {
      component: RangeResult,
      match: ({ type }) => type.kind === 'range',
    },
    {
      component: InlineCodeError,
      match: ({ type, variant }) =>
        type.kind === 'type-error' && variant === 'inline',
    },
  ];

  return (resultTypes.find(({ match }) => match(props))?.component ??
    DefaultResult) as ResultComponent<T>;
}
