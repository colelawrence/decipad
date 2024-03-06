import { CellValueType, TableCellType } from '@decipad/editor-types';
import DeciNumber, { N, ZERO } from '@decipad/number';
import {
  AST,
  RemoteComputer,
  areUnitsConvertible,
  convertBetweenUnits,
  type Result,
  Unit,
  SerializedType,
  parseStatement,
  isExpression,
  parseExpressionOrThrow,
  parseSimpleValue,
  walkAst,
} from '@decipad/remote-computer';
import { formatUnit, formatError } from '@decipad/format';
import { PromiseOrType, containsExprRef, containsNumber } from '@decipad/utils';
import { astNode } from './utils/astNode';
import { dateToAST } from './utils/dateToAST';
import { unitToAST } from './utils/unitToAST';
import { inferType } from './inferType';

type ParseCellResult = AST.Expression | Error | null;

const defaultLocale = 'en-US'; // TODO: make this dynamic

const parsing = async (
  computer: RemoteComputer,
  type: SerializedType,
  text: string,
  afterParse: (result: Result.Result) => PromiseOrType<ParseCellResult>
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

  /**
   * This comes from the need to get a percentage number.
   * If we have `10` as a percentage,previously we had `1000%`.
   * However,we would prefer to have 10%
   * Hence the division
   */
  if (
    parseResult.solution.type === 'literal' &&
    type.kind === 'number' &&
    type.numberFormat === 'percentage' &&
    parseResult.solution.args[0] === 'number' &&
    parseResult.solution.args[2] !== 'percentage'
  ) {
    parseResult.solution.args[2] = 'percentage';
    parseResult.solution.args[1] = parseResult.solution.args[1].div(N('100'));
  }

  let result = await computer.expressionResult(parseResult.solution);
  if (result.type.kind === 'type-error') {
    return new Error(formatError(defaultLocale, result.type.errorCause));
  }
  if (type.kind && type.kind !== 'anything' && type.kind !== result.type.kind) {
    return new Error(`Could not parse "${text}" into a ${type.kind}`);
  }
  if (result.type.kind === 'number' && !containsNumber(text)) {
    result = {
      type: { kind: 'string' },
      value: text,
    };
  }

  try {
    return afterParse(result);
  } catch (err) {
    return err as Error;
  }
};

const fixCellUnit = (unit: Unit.Unit[]): Unit.Unit[] => {
  return unit.map((u): Unit.Unit => {
    return {
      ...u,
      multiplier: N(u.multiplier),
      exp: N(u.exp),
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

export const parseCell = async (
  computer: RemoteComputer,
  _cellType: CellValueType,
  text: string
): Promise<AST.Expression | Error | null> => {
  let cellType: CellValueType = _cellType;
  if (
    cellType.kind === 'table-formula' ||
    cellType.kind === 'series' ||
    cellType.kind === 'dropdown' ||
    !text.trim()
  ) {
    return null;
  }
  const constant = cellType.kind === 'constant' && cellType.constant;
  if (constant) {
    cellType = { kind: 'number', unit: null };
  }

  if (containsExprRef(text) && !parseSimpleValue(text)) {
    const exp = parseExpressionOrThrow(text);
    let allRefsExist = true;

    walkAst(exp, (node) => {
      if (node.type !== 'ref') {
        return;
      }

      if (allRefsExist) {
        // returning false;
        allRefsExist = computer.variableExists(node.args[0]);
      }
    });

    if (allRefsExist) {
      return exp;
    }
  }

  //
  // If you have `exprRef` in your cell, it means you are referencing a variable.
  // Let's parse the expression normally.
  //
  // if (containsExprRef(text)) {
  //   const inferred = await inferType(computer, text, {
  //     type: cellType as SerializedType,
  //   });
  //   return parseExpressionOrThrow(inferred.coerced!);
  // }

  try {
    const parsedValue = await parsing(
      computer,
      cellType as SerializedType,
      text,
      (result: Result.Result): ParseCellResult => {
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
              result.value = Unit.convertToMultiplierUnit(
                convertBetweenUnits(
                  result.value as DeciNumber,
                  type.unit,
                  cellUnit
                ),
                cellUnit
              );
            }

            if (type.numberFormat) {
              return astNode(
                'literal',
                'number' as const,
                N(result.value as DeciNumber),
                type.numberFormat
              );
            }

            const literal = astNode(
              'literal',
              'number' as const,
              N(result.value as DeciNumber)
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
            return dateToAST(cellType, result.value as bigint);

          case 'boolean':
            return astNode(
              'literal',
              'boolean',
              text === 'true' || text === 'yes'
            );

          case 'string':
            return astNode('literal', 'string', text);
        }
        return new Error(`Could not parse a ${cellType.kind} out of "${text}"`);
      }
    );
    if (parsedValue && constant && !(parsedValue instanceof Error)) {
      const node = astNode(
        'function-call',
        astNode('funcref', 'implicit*'),
        astNode('argument-list', parsedValue, astNode('ref', constant.name))
      );

      return node;
    }
    return parsedValue;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('error parsing cell:', err);
    throw err;
  }
};

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
    return dateToAST(cellType, undefined);
  }
  if (cellType.kind === 'number') {
    return astNode('literal', 'number', ZERO);
  }
  if (cellType.kind === 'boolean') {
    return astNode('literal', 'boolean', false);
  }
  if (cellType.kind === 'dropdown' && cellType.type === 'number') {
    return astNode('literal', 'number', ZERO);
  }
  return astNode('literal', 'string', '');
};
