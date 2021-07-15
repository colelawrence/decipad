import pSeries from 'p-series';

import { AST, Time } from '..';
import { InferError, Type } from '../type';
import {
  getDefined,
  zip,
  getIdentifierString,
  getOfType,
  pairwise,
} from '../utils';
import { getDateFromAstForm } from '../date';

import { callBuiltin } from './callBuiltin';
import { Context, makeContext } from './context';
import { inferSequence } from './sequence';
import { findBadColumn, unifyColumnSizes, getLargestColumn } from './table';
import { resolve as resolveData } from '../data';
import { inferData } from './data';

export { makeContext };

const withErrorSource =
  <T extends AST.Node>(fn: (ctx: Context, thing: T) => Promise<Type>) =>
  async (ctx: Context, thing: T): Promise<Type> => {
    const type = await fn(ctx, thing);

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
export const inferExpression = withErrorSource(
  async (ctx: Context, expr: AST.Expression): Promise<Type> => {
    switch (expr.type) {
      case 'ref': {
        const name = getIdentifierString(expr);

        if (ctx.stack.has(name)) {
          return ctx.stack.get(name);
        } else {
          return Type.Impossible.withErrorCause(
            `The variable ${name} does not exist`
          );
        }
      }
      case 'literal': {
        const [litType, , litUnit] = expr.args;

        return Type.build({ type: litType, unit: litUnit });
      }
      case 'time-quantity': {
        const units = expr.args.filter(
          (a) => typeof a === 'string'
        ) as Time.Unit[];

        return Type.buildTimeQuantity(units);
      }
      case 'range': {
        const [start, end] = await pSeries(
          expr.args.map((expr) => () => inferExpression(ctx, expr))
        );

        return Type.combine(start, end).mapType(() => {
          const rangeOf =
            start.date != null
              ? start.sameAs(end)
              : start.isScalar('number').sameAs(end);

          return Type.buildRange(rangeOf);
        });
      }
      case 'sequence': {
        return await inferSequence(ctx, expr);
      }
      case 'date': {
        const [, specificity] = getDateFromAstForm(expr.args);
        return Type.buildDate(specificity);
      }
      case 'column': {
        const cellTypes = await pSeries(
          expr.args[0].map((a) => () => inferExpression(ctx, a))
        );

        return Type.buildListLike(cellTypes);
      }
      case 'table': {
        const columns = expr.args;

        ctx.inTable = true;

        const tableType = await ctx.stack.withPush(async () => {
          const columnDefs = [];
          const columnNames = [];

          for (const [colDef, expr] of pairwise<AST.ColDef, AST.Expression>(
            columns
          )) {
            const name = getIdentifierString(colDef);
            const type = await inferExpression(ctx, expr);

            ctx.stack.set(name, type);

            columnDefs.push(type);
            columnNames.push(name);
          }

          return Type.buildTuple(columnDefs, columnNames);
        });
        ctx.inTable = false;

        return tableType.mapType(() => {
          const unified =
            findBadColumn(tableType) ?? unifyColumnSizes(expr, tableType);
          return unified;
        });
      }
      case 'property-access': {
        const tableName = getIdentifierString(expr.args[0]);
        const colName = expr.args[1];
        const table = ctx.stack.get(tableName);

        if (table != null) {
          const columnIndex = table.tupleNames?.indexOf(colName) ?? -1;

          if (columnIndex !== -1) {
            return getDefined(table.tupleTypes?.[columnIndex]);
          } else {
            return Type.Impossible.withErrorCause(
              `The column ${colName} does not exist`
            );
          }
        } else {
          return Type.Impossible.withErrorCause(
            `The table ${tableName} does not exist`
          );
        }
      }
      case 'function-call': {
        const fName = getIdentifierString(expr.args[0]);
        const fArgs = getOfType('argument-list', expr.args[1]).args;
        const givenArguments: Type[] = await pSeries(
          fArgs.map((arg) => () => inferExpression(ctx, arg))
        );

        if (ctx.inTable && fName === 'previous') {
          return givenArguments[0];
        }

        const functionDefinition = ctx.functionDefinitions.get(fName);

        if (functionDefinition != null) {
          return await inferFunction(ctx, functionDefinition, givenArguments);
        } else {
          return callBuiltin(expr, fName, ...givenArguments);
        }
      }
      case 'given': {
        const [ref, body] = expr.args;
        const refName = getIdentifierString(ref);

        const { cellType, columnSize, tupleTypes, tupleNames } =
          await inferExpression(ctx, ref);

        const largestColumn =
          tupleTypes != null ? getLargestColumn(tupleTypes) : null;

        return await ctx.stack.withPush(async () => {
          if (cellType != null && columnSize != null) {
            ctx.stack.set(refName, cellType);

            const bodyResult = await inferExpression(ctx, body);

            return Type.buildColumn(bodyResult, columnSize);
          } else if (
            tupleTypes != null &&
            tupleNames != null &&
            largestColumn != null
          ) {
            const rowTypes = tupleTypes.map((t) => t.reduced());
            ctx.stack.set(refName, Type.buildTuple(rowTypes, tupleNames));

            const bodyType = await inferExpression(ctx, body);

            if (bodyType.tupleTypes != null && bodyType.tupleNames != null) {
              // Returned a row -- rebuild column-oriented table
              return Type.buildTuple(
                bodyType.tupleTypes.map((t) =>
                  Type.buildColumn(t, largestColumn)
                ),
                bodyType.tupleNames
              );
            } else {
              // Returned a number or something else.
              return Type.buildColumn(bodyType, largestColumn);
            }
          } else {
            return Type.Impossible.withErrorCause('Column or table expected');
          }
        });
      }
      case 'imported-data': {
        const [url, contentType] = expr.args;
        const data = await resolveData({ url, contentType, fetch: ctx.fetch });
        return await inferData(data, ctx);
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

      return Type.Impossible.withErrorCause(error);
    }

    for (const [argDef, arg] of zip(fArgs.args, givenArguments)) {
      ctx.stack.set(getIdentifierString(argDef), arg);
    }

    let returned;

    for (const statement of fBody.args) {
      returned = await inferStatement(ctx, statement);
    }

    return getDefined(returned, 'panic: function did not return');
  } finally {
    ctx.stack.pop();
  }
};

export const inferStatement = withErrorSource(
  async (
    /* Mutable! */ ctx: Context,
    statement: AST.Statement
  ): Promise<Type> => {
    switch (statement.type) {
      case 'assign': {
        const [nName, nValue] = statement.args;

        const varName = getIdentifierString(nName);
        const type = await (!ctx.stack.top.has(varName)
          ? inferExpression(ctx, nValue)
          : Type.Impossible.withErrorCause(
              `A variable with the name ${varName} already exists`
            ));

        ctx.stack.set(varName, type);
        return type;
      }
      case 'function-definition': {
        const fName = getIdentifierString(statement.args[0]);

        ctx.functionDefinitions.set(fName, statement);

        return Type.FunctionPlaceholder;
      }
      default: {
        return await inferExpression(ctx, statement);
      }
    }
  }
);

export interface InferProgramResult {
  variables: Map<string, Type>;
  blockReturns: Array<Type>;
}

export const inferProgram = async (
  program: AST.Block[],
  ctx = makeContext()
): Promise<InferProgramResult> => {
  const blockReturns: Array<Type> = [];

  for (const block of program) {
    if (block.args.length === 0) {
      throw new Error('panic: unexpected empty block');
    }

    for (let i = 0; i < block.args.length; i++) {
      const returnedValue = await inferStatement(ctx, block.args[i]);

      if (i === block.args.length - 1) {
        blockReturns.push(getDefined(returnedValue));
      }
    }
  }

  return {
    variables: ctx.stack.top,
    blockReturns,
  };
};

export const inferTargetStatement = async (
  program: AST.Block[],
  [blockId, statementOffset]: [blockId: number, statementOffset: number],
  ctx = makeContext()
): Promise<Type> => {
  for (let blockIndex = 0; blockIndex < program.length; blockIndex++) {
    const block = program[blockIndex];

    for (
      let statementIndex = 0;
      statementIndex < block.args.length;
      statementIndex++
    ) {
      const type = await inferStatement(ctx, block.args[statementIndex]);

      if (blockIndex === blockId && statementOffset === statementIndex) {
        if (type instanceof Type) {
          return type;
        } else {
          throw new Error('panic: trying to infer the type of a function');
        }
      }
    }
  }

  throw new Error(
    'panic: target not found: ' + JSON.stringify([blockId, statementOffset])
  );
};
