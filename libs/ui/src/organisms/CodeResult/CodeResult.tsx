import {
  Result,
  SerializedTypeKind,
  isColumn,
  isTable,
} from '@decipad/computer';
import { isDeciNumberInput } from '@decipad/number';
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
  FunctionResult,
  NumberResult,
  PendingResult,
} from '../../atoms';
import TextResult from '../../atoms/TextResult/TextResult';
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
    component: AnyResult,
    match: ({ type, value }) =>
      type.kind !== 'function' &&
      type.kind !== 'pending' &&
      (type.kind === 'anything' ||
        type.kind === 'nothing' ||
        (type.kind !== 'type-error' &&
          (value == null || value === Result.Unknown))),
  },
  {
    component: FunctionResult,
    match: ({ type }) => type.kind === 'function',
  },
  {
    component: NumberResult,
    match: ({ type, value }) =>
      type.kind === 'number' && isDeciNumberInput(value),
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
    match: ({ type, variant }) => isTable(type) && variant === 'block',
  },
  {
    component: InlineTableResult,
    match: ({ type, variant }) => isTable(type) && variant === 'inline',
  },
  {
    component: ColumnResult,
    match: ({ type, variant }) => isColumn(type) && variant === 'block',
  },
  {
    component: InlineColumnResult,
    match: ({ type, variant }) => isColumn(type) && variant === 'inline',
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
    component: TextResult,
    match: ({ type }) => type.kind === 'string',
  },
  {
    component: InlineCodeError,
    match: ({ type, variant }) =>
      type.kind === 'type-error' && variant === 'inline',
  },
  {
    component: PendingResult,
    match: ({ type }) => type.kind === 'pending',
  },
];

function getResultComponent<T extends SerializedTypeKind>(
  props: CodeResultProps<T>
): CodeResultComponentType<T> | undefined {
  return (
    (props.type &&
      ((getResultMatchers().find(({ match }) => match(props))?.component ??
        DefaultResult) as CodeResultComponentType<T>)) ||
    undefined
  );
}

// Component

export function CodeResult<T extends SerializedTypeKind>(
  props: CodeResultProps<T>
): ReturnType<React.FC> {
  const { type, value, variant = 'block', element, tooltip } = props;
  const ResultComponent = getResultComponent({
    value,
    variant,
    type,
    element,
    tooltip,
  });
  // Does not present result when result is not present, except for type errors.
  if (
    !ResultComponent ||
    (value == null && type.kind !== 'type-error' && type.kind !== 'date')
  ) {
    return <></>;
  }

  return <ResultComponent {...props} />;
}
