import { type SerializedTypeKind, Unknown } from '@decipad/language-interfaces';
import { isColumn, isTable } from '@decipad/computer';
import { isDeciNumberInput } from '@decipad/number';
import { CodeResultProps } from '../../../types';
import { InlineCodeError } from '../InlineCodeError/InlineCodeError';
import { AnyResult } from '../AnyResult/AnyResult';
import { FunctionResult } from '../FunctionResult/FunctionResult';
import { BooleanResult } from '../BooleanResult/BooleanResult';
import { TableResult } from '../TableResult/TableResult';
import { ColumnResult } from '../ColumnResult/ColumnResult';
import { InlineColumnResult } from '../InlineColumnResult/InlineColumnResult';
import { RowResult } from '../RowResult/RowResult';
import { InlineRowResult } from '../InlineRowResult/InlineRowResult';
import { RangeResult } from '../RangeResult/RangeResult';
import { PendingResult } from '../PendingResult/PendingResult';
import { NumberResult } from '../NumberResult/NumberResult';
import { DateResult } from '../DateResult/DateResult';
import { DefaultFunctionResult } from '../DefaultFunctionResult/DefaultFunctionResult';
import { ExpandedFunctionResult } from '../ExpandedFunctionResult/ExpandedFunctionResult';
import { BlockCodeError } from '../BlockCodeError/BlockCodeError';
import TextResult from '../TextResult/TextResult';
import { memo, useMemo } from 'react';

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
const InlineTreeResult: CodeResultComponentType<'tree'> = () => (
  <span>Tree</span>
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
  {
    component: InlineTreeResult,
    match: ({ type }) => type.kind === 'tree',
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

function UnmemoedCodeResult<T extends SerializedTypeKind>(
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
  const ResultComponent = useMemo(
    () =>
      getResultComponent({
        value,
        variant,
        type,
        element,
        tooltip,
        isLiveResult,
        expanded,
      }),
    [element, expanded, isLiveResult, tooltip, type, value, variant]
  );
  // Does not present result when result is not present, except for type errors.
  if (
    !ResultComponent ||
    (value == null && type.kind !== 'type-error' && type.kind !== 'date')
  ) {
    return <></>;
  }

  return <ResultComponent {...props} />;
}

export const CodeResult = memo(UnmemoedCodeResult);
