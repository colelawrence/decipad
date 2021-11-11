import pSeries from 'p-series';
import { produce } from 'immer';

import { AST, Time } from '..';
import { InferError, Type, build as t } from '../type';
import { getDefined, zip, getIdentifierString, getOfType } from '../utils';
import { getDateFromAstForm } from '../date';

import { callBuiltinFunctor } from '../builtins';
import { Context, makeContext, pushStackAndPrevious } from './context';
import { inferSequence } from './sequence';
import { inferTable } from './table';
import { resolve as resolveData } from '../data';
import { inferData } from './data';
import { inferAs } from './as';

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

        return value ?? t.impossible(InferError.missingVariable(name));
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
        const [litType, , litUnit] = expr.args;

        return litType === 'number' ? t.number(litUnit) : t[litType]();
      }
      case 'time-quantity': {
        const units = expr.args.filter(
          (a) => typeof a === 'string'
        ) as Time.Unit[];

        return t.timeQuantity(units);
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
        const cellTypes = await pSeries(
          expr.args[0].args.map((a) => () => inferExpression(ctx, a))
        );

        const erroredCell = cellTypes.find((cell) => cell.errorCause != null);
        if (erroredCell != null) return erroredCell;

        if (cellTypes.length === 0) {
          return t.impossible(InferError.unexpectedEmptyColumn());
        } else {
          const [cellType, ...hopefullyConsistentTypes] = cellTypes;

          for (const furtherCell of hopefullyConsistentTypes) {
            const unified = furtherCell.sameAs(cellType);
            if (unified.errorCause) {
              return t.impossible(
                InferError.columnContainsInconsistentType(cellType, furtherCell)
              );
            }
          }

          return t.column(cellType, cellTypes.length);
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

        const getFromTableOrRow = (names: string[], types: Type[]) =>
          types[names.indexOf(propName)] ??
          t.impossible(
            `The property ${propName} does not exist in ${tableName}`
          );

        if (table.errorCause) {
          return table;
        } else if (
          table?.columnNames != null &&
          table?.columnTypes != null &&
          table?.tableLength != null
        ) {
          return t.column(
            getFromTableOrRow(table.columnNames, table.columnTypes),
            table.tableLength,
            table.indexName
          );
        } else {
          const { rowCellNames, rowCellTypes } = table;
          return getFromTableOrRow(
            getDefined(rowCellNames),
            getDefined(rowCellTypes)
          );
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
      case 'given': {
        const [ref, body] = expr.args;
        const refName = getIdentifierString(ref);
        const refType = await inferExpression(ctx, ref);

        if (refType.errorCause) return refType;

        const { cellType, columnSize, tableLength, columnTypes, columnNames } =
          refType;

        return pushStackAndPrevious(ctx, async () => {
          if (cellType != null && columnSize != null) {
            ctx.stack.set(refName, cellType);

            const bodyResult = await inferExpression(ctx, body);

            return t.column(bodyResult, columnSize, refType.indexedBy);
          } else if (
            tableLength != null &&
            columnTypes != null &&
            columnNames != null
          ) {
            ctx.stack.set(refName, t.row(columnTypes, columnNames));

            const bodyType = await inferExpression(ctx, body);

            if (
              bodyType.tableLength === 1 &&
              bodyType.columnTypes != null &&
              bodyType.columnNames != null
            ) {
              // Returned a single row -- rebuild table with the correct number of rows and index
              return produce(bodyType, (type) => {
                type.tableLength = tableLength;
                type.indexName = refType.indexName;
              });
            } else if (bodyType.tableLength != null) {
              return t.impossible('Cannot nest tables');
            } else {
              // Returned a number or something else.
              return t.column(bodyType, tableLength, refType.indexName);
            }
          } else {
            return t.impossible('Column or table expected');
          }
        });
      }
      case 'imported-data': {
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
          return inferData(ctx, ctx.inAssignment, data);
        } catch (err) {
          return t.impossible((err as Error).message);
        }
      }
      case 'as': {
        const [left, unit] = expr.args;
        return inferAs(ctx, left, unit);
      }
    }
  }
);

export const inferFunction = async (
  ctx: Context,
  func: AST.FunctionDefinition,
  givenArguments: Type[]
): Promise<Type> => {
  try {
    ctx.stack.push();

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
  } finally {
    ctx.stack.pop();
  }
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
          : t.impossible(`A variable with the name ${varName} already exists`));
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
