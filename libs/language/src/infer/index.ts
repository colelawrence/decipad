import pSeries from 'p-series';
import { produce } from 'immer';

import { AST, Time } from '..';
import { InferError, Type, build as t } from '../type';
import {
  getDefined,
  zip,
  getIdentifierString,
  getOfType,
  pairwise,
} from '../utils';
import { getDateFromAstForm } from '../date';

import { callBuiltinFunctor } from '../builtins';
import { Context, makeContext } from './context';
import { inferSequence } from './sequence';
import { unifyColumnSizes } from './table';
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

/** Push the stack and set Context.hasPrevious for the duration of `fn` */
const pushStackAndPrevious = async (
  ctx: Context,
  fn: () => Promise<Type>
): Promise<Type> => {
  const savedHasPrevious = ctx.hasPrevious;
  ctx.hasPrevious = true;
  try {
    return await ctx.stack.withPush(fn);
  } finally {
    ctx.hasPrevious = savedHasPrevious;
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
          expr.args[0].map((a) => () => inferExpression(ctx, a))
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
        const columns = expr.args;

        return pushStackAndPrevious(ctx, async () => {
          const columnTypes = [];
          const columnNames = [];

          for (const [colDef, expr] of pairwise<AST.ColDef, AST.Expression>(
            columns
          )) {
            const name = getIdentifierString(colDef);
            // eslint-disable-next-line no-await-in-loop
            const type = await inferExpression(ctx, expr);

            // Bail on error
            if (type.errorCause) {
              return type;
            }

            ctx.stack.set(name, type);

            columnTypes.push(type);
            columnNames.push(name);
          }

          return unifyColumnSizes(columnTypes, columnNames);
        });
      }
      case 'property-access': {
        const tableName = getIdentifierString(expr.args[0]);
        const propName = expr.args[1];
        const table = ctx.stack.get(tableName);

        const getFromTableOrRow = (names: string[], types: Type[]) => {
          const index = names.indexOf(propName);

          if (index !== -1) {
            return types[index];
          } else {
            return t.impossible(
              `The property ${propName} does not exist in ${tableName}`
            );
          }
        };

        if (table?.rowCellNames != null && table?.rowCellTypes != null) {
          return getFromTableOrRow(table.rowCellNames, table.rowCellTypes);
        } else if (
          table?.columnNames != null &&
          table?.columnTypes != null &&
          table?.tableLength != null
        ) {
          return t.column(
            getFromTableOrRow(table.columnNames, table.columnTypes),
            table.tableLength
          );
        } else if (table != null) {
          return t.impossible(`${tableName} is not a table`);
        } else {
          return t.impossible(InferError.missingVariable(tableName));
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
          return callBuiltinFunctor(fName, ...givenArguments);
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

            return t.column(bodyResult, columnSize);
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
              // Returned a single row -- rebuild table with the correct number of rows
              return produce(bodyType, (type) => {
                type.tableLength = tableLength;
              });
            } else if (bodyType.tableLength != null) {
              return t.impossible('Cannot nest tables');
            } else {
              // Returned a number or something else.
              return t.column(bodyType, tableLength);
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
          return inferData(data, ctx);
        } catch (err) {
          return t.impossible(err.message);
        }
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
          : t.impossible(`A variable with the name ${varName} already exists`));

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
      // eslint-disable-next-line no-await-in-loop
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
      // eslint-disable-next-line no-await-in-loop
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
    `panic: target not found: ${JSON.stringify([blockId, statementOffset])}`
  );
};
