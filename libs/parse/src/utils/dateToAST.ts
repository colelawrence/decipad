import { AST } from '@decipad/computer';
import { CellValueType } from '@decipad/editor-types';
import { dateFromMillis } from '@decipad/utils';
import { DateTime } from 'luxon';
import { astNode } from './astNode';

type DatePropName = 'year' | 'month' | 'day' | 'hour' | 'minute';

const datePartValue = (
  date: DateTime | undefined,
  propName: DatePropName
): bigint | undefined => {
  if (date == null) {
    return undefined;
  }
  return BigInt(date[propName]);
};

export const dateToAST = (
  cellType: CellValueType,
  asDate: bigint | undefined
) => {
  const parts: AST.Date['args'] = [];
  const date = (asDate != null && dateFromMillis(asDate)) || undefined;

  (() => {
    parts.push('year', datePartValue(date, 'year'));
    if (cellType.kind === 'date' && cellType.date === 'year') return;

    parts.push('month', datePartValue(date, 'month'));
    if (cellType.kind === 'date' && cellType.date === 'month') return;

    parts.push('day', datePartValue(date, 'day'));
    if (cellType.kind === 'date' && cellType.date === 'day') return;

    parts.push('hour', datePartValue(date, 'hour'));
    parts.push('minute', datePartValue(date, 'minute'));
  })();

  return astNode('date', ...parts);
};
