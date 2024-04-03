import type {
  DataViewFilter,
  DataViewOperation,
  TableCellType,
} from '@decipad/editor-types';

export type OperationArguments = DataViewFilter['valueOrValues'];

export type OperatorToLanguageFn = (
  ref: string,
  args: OperationArguments,
  columnType: TableCellType
) => string | false | undefined;

const formatValue = (value: string | boolean | number, type: TableCellType) => {
  if (type.kind === 'date') {
    return `date(${value})`;
  }
  return JSON.stringify(value);
};

const filters: Record<DataViewOperation, OperatorToLanguageFn> = {
  eq: (ref, args, columnType) =>
    args != null &&
    !Array.isArray(args) &&
    `${ref} == ${formatValue(args, columnType)}`,
  ne: (ref, args, columnType) =>
    args != null &&
    !Array.isArray(args) &&
    `${ref} != ${formatValue(args, columnType)}`,
  in: (ref, args, columnType) =>
    Array.isArray(args) &&
    args
      .map((arg) =>
        arg != null ? `${ref} == ${formatValue(arg, columnType)}` : ''
      )
      .filter(Boolean)
      .join(' or '),
  bt: (ref, args, columnType) => {
    if (!Array.isArray(args) || args.length !== 2) {
      return undefined;
    }
    const expressions: string[] = [];
    const [from, to] = args;
    if (from != null) {
      expressions.push(`${ref} >= ${formatValue(from, columnType)}`);
    }
    if (to != null) {
      expressions.push(`${ref} <= ${formatValue(to, columnType)}`);
    }
    return expressions.join(' and ');
  },
};

export const getFilterExpression = (
  op: DataViewOperation,
  ref: string,
  args: OperationArguments,
  columnType: TableCellType
): string => filters[op](ref, args, columnType) || '';
