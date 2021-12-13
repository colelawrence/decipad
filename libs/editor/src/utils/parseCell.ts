import Fraction from '@decipad/fraction';
import { AST } from '@decipad/language';
import { getDefined } from '@decipad/utils';
import { parse } from 'date-fns';
import { TableCellType } from './tableTypes';
import { astNode } from './astNode';

export function parseCell(
  cellType: TableCellType,
  text: string
): AST.Expression | null {
  switch (cellType) {
    case 'number': {
      const n = Number(text);
      if (!Number.isNaN(n)) {
        return astNode(
          'literal',
          'number' as const,
          new Fraction(n || 0),
          null
        );
      }
      return null;
    }
    case 'string': {
      return astNode('literal', 'string' as const, text);
    }
    default: {
      const asDate: Date | null = parseDate(cellType, text);

      if (!asDate) return null;

      return dateToAST(cellType, asDate);
    }
  }
}

export const getNullReplacementValue = (
  cellType: TableCellType
): AST.Expression => {
  if (cellType.startsWith('date/')) {
    return dateToAST(cellType, new Date('2020-01-01'));
  }
  if (cellType === 'number') {
    return getDefined(parseCell(cellType, '0'));
  }
  throw new Error(`unexpected cell type ${cellType}`);
};

function dateToAST(cellType: TableCellType, asDate: Date) {
  const parts: AST.Date['args'] = [];

  (() => {
    parts.push('year', BigInt(asDate.getUTCFullYear()));
    if (cellType === 'date/year') return;

    parts.push('month', BigInt(asDate.getUTCMonth() + 1));
    if (cellType === 'date/month') return;

    parts.push('day', BigInt(asDate.getUTCDate()));
    if (cellType === 'date/day') return;

    parts.push('hour', BigInt(asDate.getUTCHours()));
    parts.push('minute', BigInt(asDate.getUTCMinutes()));
  })();

  return astNode('date', ...parts);
}

const dateFormats = (text: string, formatStrings: string[]) => {
  const normalized = text
    .trim()
    .replace('T', ' ')
    .replace(/\//g, '-')
    .toLowerCase();

  for (const fmt of formatStrings) {
    const d = parse(normalized, fmt, new Date(2020, 0, 1));

    if (!Number.isNaN(d.valueOf()))
      return new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000);
  }
  return null;
};

// Format strings reference:
// https://date-fns.org/v2.25.0/docs/format
const yearFormats = ['yy', 'yyyy'];
const monthFormats = ['yyyy-MM', 'MM-yyyy'];
const dayFormats = ['dd-MM-yyyy', 'yyyy-MM-dd'];
const timeFormats = [
  'H:m',
  'HH:mm',
  'HHmm',
  'HH:mm:ss',
  'h:m aaa',
  'hh:mm aaa',
  'hhmm aaa',
  'hh:mm:ss aaa',
];
const dateTimeFormats = [
  ...dayFormats.flatMap((date) =>
    timeFormats.flatMap((time) => [`${date} ${time}`, `${time} ${date}`])
  ),
];

export function parseDate(cellType: TableCellType, text: string): Date | null {
  switch (cellType) {
    case 'date/year': {
      return dateFormats(text, yearFormats);
    }
    case 'date/month': {
      return dateFormats(text, monthFormats);
    }
    case 'date/day': {
      return dateFormats(text, dayFormats);
    }
    case 'date/time': {
      return dateFormats(text, dateTimeFormats);
    }
    default:
      throw new Error(`unknown cell type ${cellType}`);
  }
}
