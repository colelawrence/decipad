import pSeries from 'p-series';

import { AST } from '..';
import { InferError, Type, build as t, deserializeType } from '../type';
import { matchUnitArraysForColumn } from '../type/units';
import { getDefined, getIdentifierString } from '../utils';
import { getDateFromAstForm } from '../date';
import { resolve as resolveData } from '../data';
import { expandDirectiveToType } from '../directives';
import { parseUnit } from '../units';
import { inferTable } from '../tables/inference';
import { inferColumnAssign } from '../tables/column-assign';

import { Context, makeContext } from './context';
import { inferSequence } from './sequence';
import { inferData } from './data';
import { isPreviousRef } from '../previous-ref';
import { inferMatrixAssign, inferMatrixRef } from '../matrix';
import { inferCategories } from '../categories';
import { inferFunctionDefinition, inferFunctionCall } from './functions';
import { getConstantByName } from '../builtins';
import { inferMatch } from '../match/inferMatch';

export { makeContext };
export type { Context };

export const linkToAST = (ctx: Context, node: AST.Node, type: Type) => {
  ctx.nodeTypes.set(node, type);

  if (type.errorCause != null && type.node == null) {
    return type.inNode(node);
  } else {
    return type;
  }
};

const wrap =
  <T extends AST.Node>(
    fn: (ctx: Context, thing: T, cohercingTo?: Type) => Promise<Type>
  ) =>
  async (ctx: Context, thing: T, cohercingTo?: Type): Promise<Type> => {
    let type = await fn(ctx, thing);
    if (cohercingTo) {
      type = type.sameAs(cohercingTo);
    }
    return linkToAST(ctx, thing, type);
  };

/**
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
      case 'noop': {
        return t.nothing();
      }
      case 'ref': {
        const name = getIdentifierString(expr);
        if (isPreviousRef(name)) {
          return (
            (ctx.previousStatement && deserializeType(ctx.previousStatement)) ||
            t.impossible(InferError.noPreviousStatement())
          );
        }
        const c = getConstantByName(name);
        if (c) {
          return c.type;
        }
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
        if (columnItems.args.length === 0) {
          return t.impossible(InferError.unexpectedEmptyColumn());
        }
        const [firstCellNode, ...restCellNodes] = columnItems.args;
        const firstCellType = await inferExpression(ctx, firstCellNode);
        const restCellTypes = await pSeries(
          restCellNodes.map((a) => () => inferExpression(ctx, a, firstCellType))
        );

        const erroredCell = [firstCellType, ...restCellTypes].find(
          (cell) => cell.errorCause != null
        );
        if (erroredCell != null) return erroredCell;

        for (const restCell of restCellTypes) {
          if (
            !matchUnitArraysForColumn(
              firstCellType.reducedToLowest().unit,
              restCell.reducedToLowest().unit
            )
          ) {
            return t.impossible(
              InferError.columnContainsInconsistentType(firstCellType, restCell)
            );
          }
        }
        return t.column(
          firstCellType,
          columnItems.args.length,
          optionalIndex?.args[0]
        );
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
      case 'matrix-ref': {
        return inferMatrixRef(ctx, expr);
      }
      case 'function-call': {
        return inferFunctionCall(ctx, expr);
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
        return expandDirectiveToType(expr, ctx, name, args);
      }
      case 'match':
        return inferMatch(ctx, expr);
    }
  }
);

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
        const constant = getConstantByName(varName);
        const type =
          constant || ctx.stack.has(varName, 'function')
            ? t.impossible(InferError.duplicatedName(varName))
            : await inferExpression(ctx, nValue);
        ctx.inAssignment = null;

        ctx.stack.set(varName, type, 'function');
        return type;
      }
      case 'table-column-assign': {
        return inferColumnAssign(ctx, statement);
      }
      case 'matrix-assign': {
        return inferMatrixAssign(ctx, statement);
      }
      case 'categories': {
        return inferCategories(ctx, statement);
      }
      case 'function-definition': {
        return inferFunctionDefinition(ctx, statement);
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
