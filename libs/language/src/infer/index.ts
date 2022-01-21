import pSeries from 'p-series';

import { AST } from '..';
import { InferError, Type, build as t } from '../type';
import { matchUnitArraysForColumn } from '../type/units';
import { getDefined, zip, getIdentifierString, getOfType } from '../utils';
import { getDateFromAstForm } from '../date';
import { callBuiltinFunctor } from '../builtins';
import { resolve as resolveData } from '../data';
import { expandDirectiveToType } from '../directives';
import { parseUnit } from '../units';

import { Context, makeContext } from './context';
import { inferSequence } from './sequence';
import { inferTable } from './table';
import { inferData } from './data';

export { makeContext };
export type { Context };

const wrap =
  <T extends AST.Node>(fn: (ctx: Context, thing: T) => Promise<Type>) =>
  async (ctx: Context, thing: T): Promise<Type> => {
    const type = await fn(ctx, thing);
    ctx.nodeTypes.set(thing, type);

    if (type.errorCause != null && type.node == null) {
      return type.inNode(thing);
    } else {
      return type;
    }
  };

/*
 Walk depth-first into an expanded AST.Expression, collecting the type of things beneath and checking it against the current iteration's constraints.

 Given a literal, this type is always known (barring casting).
 Given a function call, this type is given by calling the functor with the arguments' types.
 Given a condition, the functor is (thentype == elsetype) and its condition must be boolean

 AST.Assign is special-cased by looking at its expression and returning just that
 */
export const inferExpression = wrap(
  // exhaustive switch
  // eslint-disable-next-line consistent-return
  async (ctx: Context, expr: AST.Expression): Promise<Type> => {
    switch (expr.type) {
      case 'ref': {
        const name = getIdentifierString(expr);
        const value = ctx.stack.get(name);

        return value ?? t.number([parseUnit(name)]);
      }
      case 'externalref': {
        const [id] = expr.args;
        const { type } = getDefined(
          ctx.externalData.get(id),
          `missing external data with ID ${id}`
        );
        return type;
      }
      case 'literal': {
        const [litType] = expr.args;

        return t[litType]();
      }
      case 'range': {
        const [start, end] = await pSeries(
          expr.args.map((expr) => () => inferExpression(ctx, getDefined(expr)))
        );

        return Type.combine(start, end).mapType(() => {
          const rangeOf =
            start.date != null
              ? start.sameAs(end)
              : start.isScalar('number').sameAs(end);

          return t.range(rangeOf);
        });
      }
      case 'sequence': {
        return inferSequence(ctx, expr);
      }
      case 'date': {
        const [, specificity] = getDateFromAstForm(expr.args);
        return t.date(specificity);
      }
      case 'column': {
        const [columnItems, optionalIndex] = expr.args;
        const cellTypes = await pSeries(
          columnItems.args.map((a) => () => inferExpression(ctx, a))
        );

        const erroredCell = cellTypes.find((cell) => cell.errorCause != null);
        if (erroredCell != null) return erroredCell;

        if (cellTypes.length === 0) {
          return t.impossible(InferError.unexpectedEmptyColumn());
        } else {
          const [firstCell, ...hopefullyConsistentRest] = cellTypes;

          for (const restCell of hopefullyConsistentRest) {
            const unified = restCell
              .reducedToLowest()
              .sameAs(firstCell.reducedToLowest());
            if (
              unified.errorCause ||
              !matchUnitArraysForColumn(
                firstCell.reducedToLowest().unit,
                restCell.reducedToLowest().unit
              )
            ) {
              return t.impossible(
                InferError.columnContainsInconsistentType(firstCell, restCell)
              );
            }
          }

          return t.column(firstCell, cellTypes.length, optionalIndex?.args[0]);
        }
      }
      case 'table': {
        return inferTable(ctx, expr);
      }
      case 'property-access': {
        const [thing, propName] = expr.args;
        const table = (await inferExpression(ctx, thing)).isTableOrRow();
        const tableName =
          thing.type === 'ref' ? thing.args[0] : table.indexName;

        const getFromTableOrRow = (
          names: string[],
          types: Type[]
        ): [Type, number] => {
          const index = names.indexOf(propName);
          if (index < 0) {
            return [
              t.impossible(
                `A column named ${propName} does not exist in ${tableName}`
              ),
              index,
            ];
          }
          return [types[index], index];
        };

        if (table.errorCause) {
          return table;
        } else if (
          table?.columnNames != null &&
          table?.columnTypes != null &&
          table?.tableLength != null
        ) {
          const [column, columnIndex] = getFromTableOrRow(
            table.columnNames,
            table.columnTypes
          );
          return t.column(
            column,
            table.tableLength,
            table.indexName,
            columnIndex
          );
        } else {
          const { rowCellNames, rowCellTypes } = table;
          const [type] = getFromTableOrRow(
            getDefined(rowCellNames),
            getDefined(rowCellTypes)
          );
          return type;
        }
      }
      case 'function-call': {
        const fName = getIdentifierString(expr.args[0]);
        const fArgs = getOfType('argument-list', expr.args[1]).args;
        const givenArguments: Type[] = await pSeries(
          fArgs.map((arg) => () => inferExpression(ctx, arg))
        );

        if (ctx.hasPrevious && fName === 'previous') {
          return givenArguments[0];
        }

        const functionDefinition = ctx.functionDefinitions.get(fName);

        if (functionDefinition != null) {
          return inferFunction(ctx, functionDefinition, givenArguments);
        } else {
          return callBuiltinFunctor(fName, givenArguments, fArgs);
        }
      }
      case 'fetch-data': {
        const [url, contentType] = expr.args;
        if (!url) {
          return t.impossible('No data URL defined');
        }
        try {
          const data = await resolveData({
            url,
            contentType,
            fetch: ctx.fetch,
          });
          return inferData(ctx.inAssignment, data);
        } catch (err) {
          return t.impossible((err as Error).message);
        }
      }
      case 'directive': {
        const [name, ...args] = expr.args;
        return expandDirectiveToType(ctx, name, args);
      }
    }
  }
);

export const inferFunction = async (
  ctx: Context,
  func: AST.FunctionDefinition,
  givenArguments: Type[]
): Promise<Type> => {
  return ctx.stack.withPushCall(async () => {
    const [fName, fArgs, fBody] = func.args;

    if (givenArguments.length !== fArgs.args.length) {
      const error = InferError.expectedArgCount(
        getIdentifierString(fName),
        fArgs.args.length,
        givenArguments.length
      );

      return t.impossible(error);
    }

    for (const [argDef, arg] of zip(fArgs.args, givenArguments)) {
      ctx.stack.set(getIdentifierString(argDef), arg);
    }

    let returned;
    for (const statement of fBody.args) {
      // eslint-disable-next-line no-await-in-loop
      returned = await inferStatement(ctx, statement);
    }

    return getDefined(returned, 'panic: function did not return');
  });
};

export const inferStatement = wrap(
  async (
    /* Mutable! */ ctx: Context,
    statement: AST.Statement
  ): Promise<Type> => {
    switch (statement.type) {
      case 'assign': {
        const [nName, nValue] = statement.args;

        const varName = getIdentifierString(nName);

        ctx.inAssignment = varName;
        const type = await (!ctx.stack.top.has(varName)
          ? inferExpression(ctx, nValue)
          : t.impossible(InferError.duplicatedName(varName)));
        ctx.inAssignment = null;

        ctx.stack.set(varName, type);
        return type;
      }
      case 'function-definition': {
        const fName = getIdentifierString(statement.args[0]);

        ctx.functionDefinitions.set(fName, statement);

        return t.functionPlaceholder();
      }
      default: {
        return inferExpression(ctx, statement);
      }
    }
  }
);

export const inferBlock = async (
  block: AST.Block,
  ctx = makeContext()
): Promise<Type> => {
  let last;
  for (const stmt of block.args) {
    // eslint-disable-next-line no-await-in-loop
    last = await inferStatement(ctx, stmt);
  }
  return getDefined(last, 'Unexpected empty block');
};

export const inferProgram = async (
  program: AST.Block[],
  ctx = makeContext()
): Promise<Context> => {
  for (const block of program) {
    // eslint-disable-next-line no-await-in-loop
    await inferBlock(block, ctx);
  }
  return ctx;
};
