import { TableCellType } from '@decipad/editor-types';
import Fraction, { FractionLike } from '@decipad/fraction';
import {
  AST,
  parseOneBlock,
  Time,
  Computer,
  areUnitsConvertible,
  convertBetweenUnits,
  convertToMultiplierUnit,
  Result,
  Unit,
} from '@decipad/computer';
import { parse } from 'date-fns';
import { simpleFormatUnit, formatUnit, formatError } from '@decipad/format';
import { getDefined } from '@decipad/utils';
import { astNode } from './astNode';

type ParseCellResult = Promise<AST.Expression | Error>;

const defaultLocale = 'en-US'; // TODO: make this dynamic

const parsing = async (
  computer: Computer,
  text: string,
  afterParse: (result: Result.Result) => ParseCellResult
): ParseCellResult => {
  const parseResult = computer.parseStatement(text);
  if (parseResult.error) {
    return new Error(parseResult.error.message);
  }
  if (!parseResult.statement || !computer.isExpression(parseResult.statement)) {
    return new Error('is not a valid expression');
  }
  const result = await computer.expressionResult(parseResult.statement);
  if (result.type.kind === 'type-error') {
    return new Error(formatError(defaultLocale, result.type.errorCause));
  }
  return afterParse(result);
};

const fixFraction = (f: FractionLike): Fraction => {
  return f instanceof Fraction ? f : new Fraction(f);
};

const fixCellUnit = (unit: Unit[]): Unit[] => {
  return unit.map((u): Unit => {
    return {
      ...u,
      multiplier: fixFraction(u.multiplier),
      exp: fixFraction(u.exp),
    };
  });
};

export async function parseCell(
  computer: Computer,
  cellType: TableCellType,
  text: string
): Promise<AST.Expression | Error | null> {
  switch (cellType.kind) {
    case 'number': {
      return parsing(computer, text, async (result) => {
        if (result.type.kind !== 'number') {
          return new Error('is not a valid expression for a number');
        }

        if (!cellType.unit && result.type.unit) {
          return new Error('unexpected unit in number');
        }
        const cellUnit = cellType.unit && fixCellUnit(cellType.unit);
        if (result.type.unit && cellUnit) {
          if (!areUnitsConvertible(result.type.unit, cellUnit)) {
            return new Error(
              `cannot convert ${formatUnit(
                'en-US',
                result.type.unit
              )} to ${formatUnit('en-US', cellUnit)} `
            );
          }
          // eslint-disable-next-line no-param-reassign
          result.value = convertToMultiplierUnit(
            convertBetweenUnits(
              result.value as Fraction,
              result.type.unit,
              cellUnit
            ),
            cellUnit
          );
        }

        const literal = astNode(
          'literal',
          'number' as const,
          new Fraction(result.value as Fraction)
        );
        const unit = unitToAST(cellUnit);

        if (unit == null) {
          return literal;
        }

        return astNode(
          'function-call',
          astNode('funcref', 'implicit*'),
          astNode('argument-list', literal, unit)
        );
      });
    }
    case 'date': {
      return parsing(computer, `date(${text})`, async (result) => {
        if (result.type.kind !== 'date' || result.type.date !== cellType.date) {
          return new Error(`date granularity must be ${cellType.date}`);
        }

        return dateToAST(cellType, new Date(Number(result.value)));
      });
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
    const formattedUnit = simpleFormatUnit(unit);
    const ast = parseOneBlock(formattedUnit);
    return ast.args.length > 0 ? (ast.args[0] as AST.Expression) : null;
  } catch {
    return null;
  }
}

export const getExpression = (exp: Error | AST.Expression): AST.Expression => {
  if (exp instanceof Error) {
    throw exp;
  }
  return exp;
};

export const getNullReplacementValue = async (
  computer: Computer,
  cellType: TableCellType
): Promise<AST.Expression> => {
  if (cellType.kind === 'date') {
    return dateToAST(cellType, new Date('2020-01-01'));
  }
  if (cellType.kind === 'number') {
    return getExpression(getDefined(await parseCell(computer, cellType, '0')));
  }
  if (cellType.kind === 'boolean') {
    return getExpression(
      getDefined(await parseCell(computer, cellType, 'true'))
    );
  }
  if (cellType.kind === 'string') {
    return getExpression(getDefined(await parseCell(computer, cellType, '')));
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
