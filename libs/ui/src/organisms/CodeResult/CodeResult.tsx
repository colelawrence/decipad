import {
  type SerializedTypeKind,
  isColumn,
  isTable,
  Unknown,
} from '@decipad/remote-computer';
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
  ExpandedFunctionResult,
  FunctionResult,
  NumberResult,
  PendingResult,
} from '../../atoms';
import TextResult from '../../atoms/TextResult/TextResult';
import { useMaterializedResult } from '../../hooks';
import { BlockCodeError, InlineCodeError } from '../../molecules';
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
    component: InlineCodeError,
    match: ({ type, variant }) =>
      type.kind === 'type-error' && variant === 'inline',
  },
  {
    component: BlockCodeError,
    match: ({ type, variant }) =>
      type.kind === 'type-error' && variant === 'block',
  },
  {
    component: AnyResult,
    match: ({ type, value }) =>
      type.kind !== 'function' &&
      type.kind !== 'pending' &&
      (type.kind === 'anything' ||
        type.kind === 'nothing' ||
        (type.kind !== 'type-error' && (value == null || value === Unknown))),
  },
  {
    component: ExpandedFunctionResult,
    match: ({ type, expanded }) => type.kind === 'function' && !!expanded,
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
    match: ({ type, variant, value }) =>
      type.kind === 'row' && variant === 'block' && Array.isArray(value),
  },
  {
    component: InlineRowResult,
    match: ({ type, variant, value }) =>
      type.kind === 'row' && variant === 'inline' && Array.isArray(value),
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
  const {
    type,
    value,
    variant = 'block',
    element,
    tooltip,
    isLiveResult,
    expanded,
  } = props;
  const materializedValue = useMaterializedResult(value) as
    | CodeResultProps<T>['value']
    | undefined;
  const shouldUseMaterializedValue =
    isLiveResult && value != null && materializedValue;
  const ResultComponent = getResultComponent({
    value: shouldUseMaterializedValue ? materializedValue : value,
    variant,
    type,
    element,
    tooltip,
    isLiveResult,
    expanded,
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
