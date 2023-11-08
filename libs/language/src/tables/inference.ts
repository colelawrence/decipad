import { getDefined, produce } from '@decipad/utils';
import { type AST } from '..';
import { Type, buildType as t, InferError } from '../type';
import { getIdentifierString, walkAst, mutateAst } from '../utils';
import { inferExpression, linkToAST } from '../infer';
import { Context, pushTableContext } from '../infer/context';
import { coerceTableColumnTypeIndices } from './dimensionCoersion';
import { sortType } from '../infer/sortType';
import { fakeFunctionCall, requiresWholeColumn } from './requiresWholeColumn';
import { operators } from '../builtins';

export const inferTable = async (ctx: Context, table: AST.Table) => {
  if (!ctx.stack.isInGlobalScope) {
    return t.impossible(InferError.forbiddenInsideFunction('table'));
  }

  const tableDef = table.args[0];
  const tableName = getIdentifierString(tableDef);
  if (ctx.stack.has(tableName, 'function')) {
    return t.impossible(InferError.duplicatedName(tableName));
  }

  const tableType = await pushTableContext(ctx, tableName, async () => {
    ctx.stack.createNamespace(tableName, 'function');

    for (const tableItem of table.args.slice(1)) {
      if (tableItem.type === 'table-column') {
        // eslint-disable-next-line no-await-in-loop
        await inferTableColumn(ctx, {
          tableName,
          columnAst: tableItem,
          columnName: getIdentifierString(tableItem.args[0]),
        });
      } else {
        throw new Error('panic: unreachable');
      }
    }

    return sortType(getDefined(ctx.stack.get(tableName, 'function')));
  });

  return produce(tableType, (type) => {
    [, type.rowCount] = tableDef.args;
  });
};

const fixColumnExp = (
  exp: AST.Expression,
  tableName: string,
  otherColumns: Map<string, Type>
): AST.Expression => {
  const insideColumnCoercionPaths: Array<number[]> = [];

  const insideColumnCoercion = (path: number[]): boolean => {
    return insideColumnCoercionPaths.some(
      (eligiblePath) =>
        eligiblePath.length === 0 || path.every((n, i) => eligiblePath[i] === n)
    );
  };

  if (requiresWholeColumn(exp)) {
    const visitFunctionCall = (
      fnCall: AST.FunctionCall,
      path: number[]
    ): AST.FunctionCall => {
      const functionName = getIdentifierString(fnCall.args[0]);
      const builtIn = operators[functionName];
      if (builtIn) {
        if (builtIn.aliasFor) {
          return visitFunctionCall(
            fakeFunctionCall(fnCall, builtIn.aliasFor),
            path
          );
        }
        if (builtIn.coerceToColumn) {
          insideColumnCoercionPaths.push(path);
        }
      }
      return fnCall;
    };

    const visitAndMutateRef = (ref: AST.Ref): AST.Ref | AST.PropertyAccess => {
      const refName = getIdentifierString(ref);
      if (otherColumns.has(refName)) {
        return {
          type: 'property-access',
          args: [
            {
              type: 'ref',
              args: [tableName],
            },
            { type: 'colref', args: [refName] },
          ],
        };
      }
      return ref;
    };

    const visitNode = (node: AST.Node, path: number[]): AST.Node => {
      if (node.type === 'function-call') {
        return visitFunctionCall(node, path);
      }
      if (node.type === 'ref' && insideColumnCoercion(path)) {
        return visitAndMutateRef(node);
      }
      return node;
    };
    return mutateAst(exp, visitNode) as AST.Expression;
  }

  return exp;
};

export async function inferTableColumn(
  ctx: Context,
  {
    columnAst,
    tableName,
    columnName,
  }: {
    columnAst: AST.TableColumnAssign | AST.TableColumn;
    tableName: string;
    columnName: string;
  }
): Promise<Type> {
  ctx.stack.createNamespace(tableName, 'function');
  const otherColumns = getDefined(
    ctx.stack.getNamespace(tableName, 'function')
  );

  // eslint-disable-next-line no-underscore-dangle
  const _exp: AST.Expression =
    columnAst.type === 'table-column' ? columnAst.args[1] : columnAst.args[2];

  let type = await pushTableContext(ctx, tableName, async () => {
    const exp = fixColumnExp(_exp, tableName, otherColumns);
    if (refersToOtherColumnsByName(exp, otherColumns)) {
      return inferTableColumnPerCell(ctx, otherColumns, exp);
    } else {
      return coerceTableColumnTypeIndices(
        await inferExpression(ctx, exp),
        tableName
      );
    }
  });

  if (columnAst.type === 'table-column-assign') {
    type = produce(type, (t) => {
      t.atParentIndex ??= columnAst.args[3] ?? null;
    });
  }

  if (!type.indexedBy) {
    type = produce(type, (t) => {
      t.indexedBy = tableName;
    });
  }

  linkToAST(columnAst, type);

  if (type.errorCause) {
    return type;
  }

  ctx.stack.setNamespaced(
    [tableName, columnName],
    type,
    'function',
    ctx.statementId
  );

  return type;
}

export async function inferTableColumnPerCell(
  ctx: Context,
  otherColumns: Map<string, Type>,
  columnAst: AST.Expression
) {
  // Make other cells in this row available
  for (const [otherColumnName, otherColumn] of otherColumns.entries()) {
    ctx.stack.set(otherColumnName, otherColumn);
  }

  return inferExpression(ctx, columnAst);
}

function* nodeNames(node: AST.Ref) {
  yield getIdentifierString(node);
  if (node.previousVarName) {
    yield node.previousVarName;
  }
}

export function refersToOtherColumnsByName(
  expr: AST.Expression,
  columns: Map<string, unknown>
) {
  let isReferringToOtherColumnByName = false;

  walkAst(expr, (node) => {
    if (node.type === 'ref') {
      for (const name of nodeNames(node)) {
        if (columns.has(name)) {
          isReferringToOtherColumnByName = true;
        }
      }
    }
  });

  return isReferringToOtherColumnByName;
}
