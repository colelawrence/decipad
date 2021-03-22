import { functors } from '../builtins';
import { FunctionType, InferError, Type, TableType, TypeName, typeNames } from '../type';
import { getDefined, getIdentifierString, getOfType } from '../utils';
import { Context, makeContext } from './context';

export { makeContext, Type, FunctionType, typeNames, TypeName, InferError };

/*
Walk depth-first into an expanded AST.Expression, collecting the type of things beneath and checking it against the current iteration's constraints.

Given a literal, this type is always known (barring casting).
Given a function call, this type is given by calling the functor with the arguments' types.
Given a condition, the functor is (thentype == elsetype) and its condition must be boolean

AST.Assign is special-cased by looking at its expression and returning just that
*/
export const inferExpression = (ctx: Context, expr: AST.Expression): Type => {
  switch (expr.type) {
    case 'ref': {
      const name = getIdentifierString(expr);

      if (ctx.stack.has(name)) {
        return ctx.stack.get(name);
      } else {
        const error = new InferError('Undefined variable ' + name);

        return Type.Impossible.inNode(expr).withErrorCause(error);
      }
    }
    case 'literal': {
      const exprType = expr.args[0] as TypeName;

      if (!typeNames.includes(exprType)) {
        throw new Error('panic: Unknown literal type ' + exprType);
      }

      return new Type(exprType).withUnit(expr.args[2]);
    }
    case 'column': {
      const columnTypes = expr.args[0].map((a) => inferExpression(ctx, a));

      if (columnTypes.length === 0) {
        return Type.Impossible.inNode(expr).withErrorCause(
          new InferError('Columns cannot be empty')
        );
      }

      const columnFunctor = (...columnTypes: Type[]) => {
        const type = new Type().isColumn(columnTypes.length);

        return columnTypes.reduce((a, b) => a.sameAs(b), type);
      };

      return Type.runFunctor(expr, columnFunctor, ...columnTypes);
    }
    case 'function-call': {
      const fName = getIdentifierString(expr.args[0]);
      const fArgs = getOfType('argument-list', expr.args[1]).args;
      const givenArguments: Type[] = fArgs.map((arg) =>
        inferExpression(ctx, arg)
      );

      const functionDefinition = ctx.functionDefinitions.get(fName);

      if (functionDefinition != null) {
        const functionType = inferFunction(
          ctx,
          functionDefinition,
          expr,
          givenArguments
        );

        return functionType.returns;
      } else {
        const functor: (...ts: Type[]) => Type = getDefined(
          fName in functors.binary
            ? functors.binary[fName]
            : functors.unary[fName],
          'panic: unknown builtin function ' + fName
        );

        return Type.runFunctor(expr, functor, ...givenArguments);
      }
    }
    case 'conditional': {
      const condArg = inferExpression(ctx, expr.args[0]);
      const thenArg = inferExpression(ctx, expr.args[1]);
      const elseArg = inferExpression(ctx, expr.args[2]);

      const functor = (condT: Type, thenT: Type, elseT: Type): Type =>
        Type.combine(condT.hasType('boolean'), thenT.sameAs(elseT));

      return Type.runFunctor(expr, functor, condArg, thenArg, elseArg);
    }
  }
};

export const inferFunction = (
  ctx: Context,
  func: AST.FunctionDefinition,
  callExpr?: AST.FunctionCall,
  givenArguments?: Type[]
): FunctionType => {
  try {
    ctx.stack.push();

    const [fName, fArgs, fBody] = func.args;

    if (givenArguments != null && callExpr != null) {
      if (givenArguments.length !== fArgs.args.length) {
        const error = new InferError(
          'Wrong number of arguments applied to ' +
            getIdentifierString(fName) +
            ' (expected ' +
            String(fArgs.args.length) +
            ')'
        );

        return {
          returns: Type.Impossible.withErrorCause(error).inNode(callExpr),
        };
      }
    }

    fArgs.args.forEach((argDef, i) => {
      const type = givenArguments != null ? givenArguments[i] : new Type();

      ctx.stack.set(getIdentifierString(argDef), type);
    });

    const statementTypes = fBody.args.map((statement) => {
      return inferStatement(ctx, statement);
    });

    const returns = statementTypes[statementTypes.length - 1];

    if (!(returns instanceof Type)) {
      throw new Error('panic: function did not return');
    }

    return { returns };
  } finally {
    ctx.stack.pop();
  }
};

export const inferStatement = (
  /* Mutable! */ ctx: Context,
  statement: AST.Statement
): Type | TableType | FunctionType => {
  switch (statement.type) {
    case 'assign': {
      const [nName, nValue] = statement.args;
      const type = inferExpression(ctx, nValue);
      ctx.stack.set(nName.args[0], type);
      return type;
    }
    case 'function-definition': {
      const fName = getIdentifierString(statement.args[0]);
      const type = inferFunction(ctx, statement);

      ctx.functionDefinitions.set(fName, statement);
      ctx.functions.set(fName, type);
      return type;
    }
    case 'table-definition': {
      const tName = getIdentifierString(statement.args[0]);
      const table: AST.TableColumns = statement.args[1]

      const tableType = ctx.stack.withPush(() => {
        const columnDefs: Map<string, Type> = new Map()

        for (let i = 0; i + 1 < table.args.length; i += 2) {
          const name = getIdentifierString(table.args[i] as AST.ColDef)
          const type = inferExpression(ctx, table.args[i + 1] as AST.Expression)

          ctx.stack.set(name, type)
          columnDefs.set(name, type)
        }

        return new TableType(columnDefs)
      })

      ctx.tables.set(tName, tableType)
      return tableType
    }
    default: {
      return inferExpression(ctx, statement);
    }
  }
};

interface InferProgramResult {
  variables: Map<string, Type>;
  functions: Map<string, FunctionType>;
  tables: Map<string, TableType>;
  blockReturns: Array<Type | TableType | FunctionType>;
}

export const inferProgram = (
  program: AST.Block[],
  ctx = makeContext()
): InferProgramResult => {
  const blockReturns: Array<Type | TableType | FunctionType> = [];

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
    tables: ctx.tables,
    functions: ctx.functions,
    blockReturns,
  };
};

export const inferTargetStatement = (
  program: AST.Block[],
  [blockId, statementOffset]: [blockId: number, statementOffset: number],
  ctx = makeContext()
): Type | TableType => {
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
        } else if (type instanceof TableType) {
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
