import { getDefined, produce } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import type { Type } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import {
  InferError,
  Value,
  buildType,
  buildType as t,
} from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import type { FullBuiltinSpec } from '@decipad/language-builtins';
// eslint-disable-next-line no-restricted-imports
import { operators } from '@decipad/language-builtins';
import type { AST } from '@decipad/language-interfaces';
import { getIdentifierString, walkAst, mutateAst } from '../utils';
import { inferExpression, linkToAST } from '../infer';
import { coerceTableColumnTypeIndices } from './dimensionCoersion';
import { sortType } from '../infer/sortType';
import { fakeFunctionCall, requiresWholeColumn } from './requiresWholeColumn';
import { withPush, type TRealm } from '../scopedRealm';

export const inferTable = async (realm: TRealm, table: AST.Table) => {
  const { inferContext: ctx } = realm;

  const tableDef = table.args[0];
  const tableName = getIdentifierString(tableDef);
  if (ctx.stack.has(tableName)) {
    return t.impossible(InferError.duplicatedName(tableName));
  }

  ctx.stack.createNamespace(tableName);
  const type = await withPush(
    realm,
    async (tableRealm) => {
      tableRealm.inferContext.stack.set('first', buildType.boolean());
      tableRealm.stack.set('first', Value.Scalar.fromValue(false));

      for (const tableItem of table.args.slice(1)) {
        if (tableItem.type === 'table-column') {
          // eslint-disable-next-line no-await-in-loop
          await inferTableColumn(tableRealm, {
            tableName,
            columnAst: tableItem,
            columnName: getIdentifierString(tableItem.args[0]),
          });
        } else {
          throw new Error('panic: unreachable');
        }
      }

      const tableType = sortType(
        getDefined(tableRealm.inferContext.stack.get(tableName))
      );

      return produce(tableType, (type) => {
        [, type.rowCount] = tableDef.args;
      });
    },
    `table ${tableName}`
  );

  realm.inferContext.stack.set(tableName, type);

  return type;
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
        if ((builtIn as FullBuiltinSpec).coerceToColumn) {
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
  realm: TRealm,
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
  const { inferContext: ctx } = realm;
  ctx.stack.createNamespace(tableName);
  const otherColumns = getDefined(ctx.stack.getNamespace(tableName));

  // eslint-disable-next-line no-underscore-dangle
  const _exp: AST.Expression =
    columnAst.type === 'table-column' ? columnAst.args[1] : columnAst.args[2];

  let type = await withPush(
    realm,
    async (columnRealm) => {
      columnRealm.inferContext.stack.set('first', buildType.boolean());
      columnRealm.stack.set('first', Value.Scalar.fromValue(false));
      const exp = fixColumnExp(_exp, tableName, otherColumns);
      if (refersToOtherColumnsByName(exp, otherColumns)) {
        return inferTableColumnPerCell(columnRealm, otherColumns, exp);
      } else {
        return coerceTableColumnTypeIndices(
          await inferExpression(columnRealm, exp),
          tableName
        );
      }
    },
    `column ${columnName}`
  );

  if (columnAst.type === 'table-column-assign') {
    type = produce(type, (t: Type) => {
      const sortOrder = columnAst.args[3];
      if (sortOrder != null) {
        t.atParentIndex = sortOrder;
      }
    });
  }

  if (!type.indexedBy) {
    type = produce(type, (t: Type) => {
      t.indexedBy = tableName;
    });
  }

  linkToAST(columnAst, type);

  ctx.stack.setNamespaced([tableName, columnName], type, realm.statementId);

  return type;
}

export async function inferTableColumnPerCell(
  realm: TRealm,
  otherColumns: Map<string, Type>,
  columnAst: AST.Expression
) {
  const { inferContext: ctx } = realm;
  // Make other cells in this row available
  for (const [otherColumnName, otherColumn] of otherColumns.entries()) {
    ctx.stack.set(otherColumnName, otherColumn);
  }

  return inferExpression(realm, columnAst);
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
