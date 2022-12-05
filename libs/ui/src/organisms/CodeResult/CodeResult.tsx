import { SerializedTypeKind } from '@decipad/computer';
import { isFractionLike } from '@decipad/fraction';
import {
  ColumnResult,
  InlineColumnResult,
  InlineRowResult,
  RangeResult,
  RowResult,
  TableResult,
} from '..';
import {
  AnyResult,
  BooleanResult,
  DateResult,
  DefaultFunctionResult,
  NumberResult,
} from '../../atoms';
import { InlineCodeError } from '../../molecules';
import { CodeResultProps } from '../../types';

// Simple result components

type CodeResultComponentType<T extends SerializedTypeKind> = (
  props: CodeResultProps<T>
) => ReturnType<React.FC>;

const DefaultResult: CodeResultComponentType<SerializedTypeKind> = ({
  value,
}) => <span>{String(value ?? '')}</span>;
const InlineTableResult: CodeResultComponentType<'table'> = () => (
  <span>Table</span>
);

// Result matchers

interface ResultMatcher {
  component: Partial<CodeResultComponentType<SerializedTypeKind>>;
  match: <T extends SerializedTypeKind>(props: CodeResultProps<T>) => boolean;
}
// Lazy to avoid strange cyclic import bug
const getResultMatchers = (): ResultMatcher[] => [
  {
    component: NumberResult,
    match: ({ type, value }) => type.kind === 'number' && isFractionLike(value),
  },
  {
    component: BooleanResult,
    match: ({ type, value }) =>
      type.kind === 'boolean' && typeof value === 'boolean',
  },
  {
    component: DateResult,
    match: ({ type }) => type.kind === 'date',
  },
  {
    component: TableResult,
    match: ({ type, variant }) => type.kind === 'table' && variant === 'block',
  },
  {
    component: InlineTableResult,
    match: ({ type, variant }) => type.kind === 'table' && variant === 'inline',
  },
  {
    component: ColumnResult,
    match: ({ type, variant }) => type.kind === 'column' && variant === 'block',
  },
  {
    component: InlineColumnResult,
    match: ({ type, variant }) =>
      type.kind === 'column' && variant === 'inline',
  },
  {
    component: RowResult,
    match: ({ type, variant }) => type.kind === 'row' && variant === 'block',
  },
  {
    component: InlineRowResult,
    match: ({ type, variant }) => type.kind === 'row' && variant === 'inline',
  },
  {
    component: DefaultFunctionResult,
    match: ({ type }) => type.kind === 'function',
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
  {
    component: AnyResult,
    match: ({ type }) => type.kind === 'anything' || type.kind === 'nothing',
  },
];

function getResultComponent<T extends SerializedTypeKind>(
  props: CodeResultProps<T>
): CodeResultComponentType<T> {
  return (getResultMatchers().find(({ match }) => match(props))?.component ??
    DefaultResult) as CodeResultComponentType<T>;
}

// Component

export function CodeResult<T extends SerializedTypeKind>(
  props: CodeResultProps<T>
): ReturnType<React.FC> {
  const { type, value, variant = 'block' } = props;
  const ResultComponent = getResultComponent({ value, variant, type });

  // Does not present result when result is not present, except for type errors.
  if (value == null && type.kind !== 'type-error') {
    return null;
  }

  return <ResultComponent {...props} />;
}
