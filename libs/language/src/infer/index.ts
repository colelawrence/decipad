import { InferError, Type, scalarTypeNames } from '../type';
import { getDefined, zip, getIdentifierString, getOfType } from '../utils';
import { DateSpecificity } from '../date';

import { callBuiltin } from './callBuiltin';
import { Context, makeContext } from './context';
import { findBadColumn, unifyColumnSizes, getLargestColumn } from './table';

export { makeContext };

const withErrorSource = <T extends AST.Node>(
  fn: (ctx: Context, thing: T) => Type
) => (ctx: Context, thing: T): Type => {
  const type = fn(ctx, thing);

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
  (ctx: Context, expr: AST.Expression): Type => {
    switch (expr.type) {
      case 'ref': {
        const name = getIdentifierString(expr);

        if (ctx.stack.has(name)) {
          return ctx.stack.get(name);
        } else {
          const error = new InferError('Undefined variable ' + name);

          return Type.Impossible.withErrorCause(error);
        }
      }
      case 'literal': {
        const [litType, , litUnit] = expr.args;

        if (!scalarTypeNames.includes(litType)) {
          throw new Error('panic: Unknown literal type ' + litType);
        }

        return Type.build({ type: litType, unit: litUnit });
      }
      case 'range': {
        const [start, end] = expr.args.map((expr) =>
          inferExpression(ctx, expr)
        );

        const rangeFunctor = (start: Type, end: Type) => {
          return Type.combine(
            start.isScalar('number').sameAs(end),
            Type.build({
              type: 'number',
              unit: start.unit,
              rangeness: true,
            })
          );
        };

        return Type.runFunctor(expr, rangeFunctor, start, end);
      }
      case 'date': {
        let lowestSegment: DateSpecificity = 'year';

        for (let i = 0; i + 1 < expr.args.length; i += 2) {
          const segment = expr.args[i] as string;

          if (segment === 'hour') {
            lowestSegment = 'time';
            break;
          } else {
            lowestSegment = segment as DateSpecificity;
          }
        }

        return Type.buildDate(lowestSegment);
      }
      case 'column': {
        const cellTypes = expr.args[0].map((a) => inferExpression(ctx, a));

        return Type.buildListLike(cellTypes);
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
            return Type.Impossible.withErrorCause('Unknown column ' + colName);
          }
        } else {
          return Type.Impossible.withErrorCause('Undefined table ' + tableName);
        }
      }
      case 'function-call': {
        const fName = getIdentifierString(expr.args[0]);
        const fArgs = getOfType('argument-list', expr.args[1]).args;
        const givenArguments: Type[] = fArgs.map((arg) =>
          inferExpression(ctx, arg)
        );

        if (ctx.inTable && fName === 'previous') {
          return givenArguments[0];
        }

        const functionDefinition = ctx.functionDefinitions.get(fName);

        if (functionDefinition != null) {
          return inferFunction(ctx, functionDefinition, givenArguments);
        } else {
          return callBuiltin(expr, fName, ...givenArguments);
        }
      }
      case 'given': {
        const [ref, body] = expr.args;
        const refName = getIdentifierString(ref);

        const {
          cellType,
          columnSize,
          tupleTypes,
          tupleNames,
        } = inferExpression(ctx, ref);

        return ctx.stack.withPush(() => {
          if (cellType != null && columnSize != null) {
            ctx.stack.set(refName, cellType);

            const bodyResult = inferExpression(ctx, body);

            return Type.buildColumn(bodyResult, columnSize);
          } else if (tupleTypes != null && tupleNames != null) {
            const rowTypes = tupleTypes.map((t) => t.reduced());
            ctx.stack.set(refName, Type.buildTuple(rowTypes, tupleNames));

            return Type.buildColumn(Type.Number, getLargestColumn(tupleTypes));
          } else {
            return Type.Impossible.withErrorCause('Column or table expected');
          }
        });
      }
    }
  }
);

export const inferFunction = (
  ctx: Context,
  func: AST.FunctionDefinition,
  givenArguments: Type[]
): Type => {
  try {
    ctx.stack.push();

    const [fName, fArgs, fBody] = func.args;

    if (givenArguments.length !== fArgs.args.length) {
      const error = new InferError(
        'Wrong number of arguments applied to ' +
          getIdentifierString(fName) +
          ' (expected ' +
          String(fArgs.args.length) +
          ')'
      );

      return Type.Impossible.withErrorCause(error);
    }

    for (const [argDef, arg] of zip(fArgs.args, givenArguments)) {
      ctx.stack.set(getIdentifierString(argDef), arg);
    }

    let returned;

    for (const statement of fBody.args) {
      returned = inferStatement(ctx, statement);
    }

    return getDefined(returned, 'panic: function did not return');
  } finally {
    ctx.stack.pop();
  }
};

export const inferStatement = withErrorSource(
  (/* Mutable! */ ctx: Context, statement: AST.Statement): Type => {
    switch (statement.type) {
      case 'assign': {
        const [nName, nValue] = statement.args;

        const varName = getIdentifierString(nName);
        const type = !ctx.stack.top.has(varName)
          ? inferExpression(ctx, nValue)
          : Type.Impossible.withErrorCause(varName + ' already exists.');

        ctx.stack.set(varName, type);
        return type;
      }
      case 'function-definition': {
        const fName = getIdentifierString(statement.args[0]);

        ctx.functionDefinitions.set(fName, statement);

        return Type.FunctionPlaceholder;
      }
      case 'table-definition': {
        const tName = getIdentifierString(statement.args[0]);
        const table: AST.TableColumns = statement.args[1];

        ctx.inTable = true;

        const tableType = ctx.stack.withPush(() => {
          const columnDefs = [];
          const columnNames = [];

          for (let i = 0; i + 1 < table.args.length; i += 2) {
            const name = getIdentifierString(table.args[i] as AST.ColDef);
            const type = inferExpression(
              ctx,
              table.args[i + 1] as AST.Expression
            );

            ctx.stack.set(name, type);

            columnDefs.push(type);
            columnNames.push(name);
          }

          return Type.buildTuple(columnDefs, columnNames);
        });
        ctx.inTable = false;

        if (tableType.errorCause != null) {
          return tableType;
        } else {
          const unified =
            findBadColumn(tableType) ?? unifyColumnSizes(statement, tableType);
          ctx.stack.set(tName, unified);
          return unified;
        }
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

export const inferProgram = (
  program: AST.Block[],
  ctx = makeContext()
): InferProgramResult => {
  const blockReturns: Array<Type> = [];

  for (const block of program) {
    if (block.args.length === 0) {
      throw new Error('panic: unexpected empty block');
    }

    for (let i = 0; i < block.args.length; i++) {
      const returnedValue = inferStatement(ctx, block.args[i]);

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

export const inferTargetStatement = (
  program: AST.Block[],
  [blockId, statementOffset]: [blockId: number, statementOffset: number],
  ctx = makeContext()
): Type => {
  for (let blockIndex = 0; blockIndex < program.length; blockIndex++) {
    const block = program[blockIndex];

    for (
      let statementIndex = 0;
      statementIndex < block.args.length;
      statementIndex++
    ) {
      const type = inferStatement(ctx, block.args[statementIndex]);

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
