import { TableCellType } from '@decipad/editor-types';
import Fraction from '@decipad/fraction';
import {
  AST,
  deserializeUnit,
  parseOneBlock,
  stringifyUnits,
  Time,
} from '@decipad/computer';
import { getDefined } from '@decipad/utils';
import { parse } from 'date-fns';
import { astNode } from './astNode';

export function parseCell(
  cellType: TableCellType,
  text: string
): AST.Expression | null {
  switch (cellType.kind) {
    case 'number': {
      const n = Number(text);
      if (Number.isNaN(n) || !Number.isFinite(n)) {
        return null;
      }

      const literal = astNode('literal', 'number' as const, new Fraction(n));
      const unit = unitToAST(cellType.unit);

      if (unit == null) {
        return literal;
      }

      return astNode(
        'function-call',
        astNode('funcref', 'implicit*'),
        astNode('argument-list', literal, unit)
      );
    }
    case 'date': {
      const asDate: Date | null = parseDate(cellType, text);

      if (!asDate) return null;

      return dateToAST(cellType, asDate);
    }
    case 'boolean': {
      const n = text === 'true';

      return astNode('literal', 'boolean' as const, n);
    }
    case 'table-formula': {
      return null;
    }
    default: {
      // NOTE: Defaulting to string catches string values but it also catches legacy iterations of
      // cell types without breaking the whole notebook.
      return astNode('literal', 'string' as const, text);
    }
  }
}

function unitToAST(
  unit: Extract<TableCellType, { kind: 'number' }>['unit']
): AST.Expression | null {
  if (unit == null) {
    return null;
  }
  try {
    // NOTE: seems more error prone to generate an AST from the Units object than to stringify the
    // units back to the language and parse the AST.
    const ast = parseOneBlock(
      stringifyUnits(deserializeUnit(unit), new Fraction(1), false)
    );
    return ast.args.length > 0 ? (ast.args[0] as AST.Expression) : null;
  } catch {
    return null;
  }
}

export const getNullReplacementValue = (
  cellType: TableCellType
): AST.Expression => {
  if (cellType.kind === 'date') {
    return dateToAST(cellType, new Date('2020-01-01'));
  }
  if (cellType.kind === 'number') {
    return getDefined(parseCell(cellType, '0'));
  }
  if (cellType.kind === 'boolean') {
    return getDefined(parseCell(cellType, 'true'));
  }
  if (cellType.kind === 'string') {
    return getDefined(parseCell(cellType, ''));
  }
  throw new Error(`unexpected cell type ${cellType}`);
};

function dateToAST(cellType: TableCellType, asDate: Date) {
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
}

const parseDateStr = (text: string, formatStrings: string[]) => {
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

const combineFormats = (a: string[], b: string[]): string[] => {
  const formats: string[] = [];
  for (const aElem of a) {
    for (const bElem of b) {
      formats.push(`${aElem} ${bElem}`);
    }
  }
  return formats;
};

// Format strings reference:
// https://date-fns.org/v2.25.0/docs/format
const dayFormats = ['dd-MM-yyyy', 'yyyy-MM-dd'];
const minuteFormats = ['HH:mm', 'HHmm', 'h:m aaa', 'hh:mm aaa', 'hhmm aaa'];
const secondFormats = ['s', 'ss'];
const fractionSecondsFormats = ['S', 'SS', 'SSS', 'SSSS'];
export const dateFormats: Record<Time.Specificity, string[]> = {
  year: ['yy', 'yyyy'],
  month: ['yyyy-MM', 'MM-yyyy'],
  day: dayFormats,
  hour: combineFormats(dayFormats, ['HH']),
  minute: combineFormats(dayFormats, minuteFormats),
  second: combineFormats(
    combineFormats(dayFormats, minuteFormats),
    secondFormats
  ),
  millisecond: combineFormats(
    combineFormats(combineFormats(dayFormats, minuteFormats), secondFormats),
    fractionSecondsFormats
  ),
};

export function parseDate(cellType: TableCellType, text: string): Date | null {
  if (cellType.kind !== 'date') {
    throw new Error(
      `Expected cell type kind 'date', received ${cellType.kind}`
    );
  }
  const formats = dateFormats[cellType.date];
  return parseDateStr(text, formats);
}
