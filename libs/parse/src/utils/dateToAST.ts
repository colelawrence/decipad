import { AST } from '@decipad/computer';
import { CellValueType } from '@decipad/editor-types';
import { astNode } from './astNode';

export const dateToAST = (cellType: CellValueType, asDate: Date) => {
  const parts: AST.Date['args'] = [];

  (() => {
    parts.push('year', BigInt(asDate.getUTCFullYear()));
    if (cellType.kind === 'date' && cellType.date === 'year') return;

    parts.push('month', BigInt(asDate.getUTCMonth() + 1));
    if (cellType.kind === 'date' && cellType.date === 'month') return;

    parts.push('day', BigInt(asDate.getUTCDate()));
    if (cellType.kind === 'date' && cellType.date === 'day') return;

    parts.push('hour', BigInt(asDate.getUTCHours()));
    parts.push('minute', BigInt(asDate.getUTCMinutes()));
  })();

  return astNode('date', ...parts);
};
