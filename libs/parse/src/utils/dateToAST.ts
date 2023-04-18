import { AST } from '@decipad/computer';
import { CellValueType } from '@decipad/editor-types';
import { astNode } from './astNode';

type DateMethodName =
  | 'getUTCFullYear'
  | 'getUTCMonth'
  | 'getUTCDate'
  | 'getUTCHours'
  | 'getUTCMinutes';

const datePartValue = (
  date: Date | undefined,
  methodName: DateMethodName,
  diff = 0
): bigint | undefined => {
  if (date == null) {
    return undefined;
  }
  return BigInt(date[methodName]() + diff);
};

export const dateToAST = (
  cellType: CellValueType,
  asDate: Date | undefined
) => {
  const parts: AST.Date['args'] = [];

  (() => {
    parts.push('year', datePartValue(asDate, 'getUTCFullYear'));
    if (cellType.kind === 'date' && cellType.date === 'year') return;

    parts.push('month', datePartValue(asDate, 'getUTCMonth', 1));
    if (cellType.kind === 'date' && cellType.date === 'month') return;

    parts.push('day', datePartValue(asDate, 'getUTCDate'));
    if (cellType.kind === 'date' && cellType.date === 'day') return;

    parts.push('hour', datePartValue(asDate, 'getUTCHours'));
    parts.push('minute', datePartValue(asDate, 'getUTCMinutes'));
  })();

  return astNode('date', ...parts);
};
