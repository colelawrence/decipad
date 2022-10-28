import { CellValueType, TableCellType } from '@decipad/editor-types';
import Fraction, { FractionLike, ZERO } from '@decipad/fraction';
import {
  AST,
  Computer,
  areUnitsConvertible,
  convertBetweenUnits,
  convertToMultiplierUnit,
  Result,
  Unit,
  SerializedType,
  parseStatement,
  isExpression,
} from '@decipad/computer';
import { formatUnit, formatError } from '@decipad/format';
import { astNode } from './utils/astNode';
import { dateToAST } from './utils/dateToAST';
import { unitToAST } from './utils/unitToAST';
import { inferType } from './inferType';
import { memoize } from './utils/memoize';

type ParseCellResult = Promise<AST.Expression | Error | null>;

const defaultLocale = 'en-US'; // TODO: make this dynamic

const parsing = async (
  computer: Computer,
  type: SerializedType,
  text: string,
  afterParse: (result: Result.Result) => ParseCellResult
): Promise<ParseCellResult> => {
  const inferred = await inferType(computer, text, { type });
  if (inferred.type.kind === 'type-error') {
    return new Error(formatError(defaultLocale, inferred.type.errorCause));
  }
  if (!inferred.coerced) {
    return null;
  }
  const parseResult = parseStatement(inferred.coerced);
  if (parseResult.error) {
    return new Error(parseResult.error.message);
  }
  if (!parseResult.solution || !isExpression(parseResult.solution)) {
    return new Error('is not a valid expression');
  }
  const result = await computer.expressionResult(parseResult.solution);
  if (result.type.kind === 'type-error') {
    return new Error(formatError(defaultLocale, result.type.errorCause));
  }
  if (type.kind && type.kind !== 'anything' && type.kind !== result.type.kind) {
    return new Error(`Could not parse "${text}" into a ${type.kind}`);
  }
  try {
    return afterParse(result);
  } catch (err) {
    return err as Error;
  }
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

export function assertCellType<Kind extends CellValueType['kind']>(
  type: CellValueType,
  kind: Kind
): asserts type is Extract<TableCellType, { kind: Kind }> {
  if (type.kind && type.kind !== kind) {
    throw new Error(`Expected input of type ${kind}`);
  }
}

export const parseCell = memoize(
  async (
    computer: Computer,
    cellType: CellValueType,
    text: string
  ): Promise<AST.Expression | Error | null> => {
    if (
      cellType.kind === 'table-formula' ||
      cellType.kind === 'series' ||
      !text.trim()
    ) {
      return null;
    }
    try {
      return await parsing(
        computer,
        cellType,
        text,
        async (result: Result.Result) => {
          const { type } = result;
          switch (type.kind) {
            case 'number': {
              assertCellType(cellType, 'number');
              if (!cellType.unit && type.unit) {
                return new Error('unexpected unit in number');
              }
              const cellUnit = cellType.unit && fixCellUnit(cellType.unit);
              if (type.unit && cellUnit) {
                if (!areUnitsConvertible(type.unit, cellUnit)) {
                  return new Error(
                    `cannot convert ${formatUnit(
                      'en-US',
                      type.unit
                    )} to ${formatUnit('en-US', cellUnit)} `
                  );
                }
                // eslint-disable-next-line no-param-reassign
                result.value = convertToMultiplierUnit(
                  convertBetweenUnits(
                    result.value as Fraction,
                    type.unit,
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
              ) as AST.Expression;
            }
            case 'date':
              return dateToAST(cellType, new Date(Number(result.value)));

            case 'boolean':
              return astNode(
                'literal',
                'boolean',
                text === 'true' || text === 'yes'
              );

            case 'string':
              return astNode('literal', 'string', text);
          }
          return new Error(
            `Could not parse a ${cellType.kind} out of "${text}"`
          );
        }
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('error parsing cell:', err);
      throw err;
    }
  }
);

export const getExpression = (exp: Error | AST.Expression): AST.Expression => {
  if (exp instanceof Error) {
    throw exp;
  }
  return exp;
};

export const getNullReplacementValue = (
  cellType: CellValueType
): AST.Expression => {
  if (cellType.kind === 'date') {
    return dateToAST(cellType, new Date('2020-01-01'));
  }
  if (cellType.kind === 'number') {
    return astNode('literal', 'number', ZERO);
  }
  if (cellType.kind === 'boolean') {
    return astNode('literal', 'boolean', false);
  }
  return astNode('literal', 'string', '');
};
