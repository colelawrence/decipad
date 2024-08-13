import { getDefined, getInstanceof } from '@decipad/utils';
import type { AST, Value as ValueTypes } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { RuntimeError, Value } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import {
  walkAst,
  getIdentifierString,
  isExpression,
} from '@decipad/language-utils';
import { refersToOtherColumnsByName } from './inference';
import { mapWithPrevious } from '../interpreter/previous';
import { evaluate } from '../interpreter';
import { coerceTableColumnIndices } from './dimensionCoersion';
import { requiresWholeColumn } from './requiresWholeColumn';
import { isPrevious } from '../utils/isPrevious';
import { withPush, type TRealm } from '../scopedRealm';
import { prettyPrintAST } from '../parser/utils';

const isRecursiveReference = (expr: AST.Expression) =>
  expr.type === 'function-call' &&
  isPrevious(getIdentifierString(expr.args[0]));

export const usesRecursion = (expr: AST.Expression) => {
  let result = false;

  walkAst(expr, (expr) => {
    if (isExpression(expr) && isRecursiveReference(expr)) {
      result = true;
    }
  });

  return result;
};

const usesOrdinalReference = (expr: AST.Expression): boolean => {
  let result = false;
  walkAst(expr, (expr) => {
    if (expr.type === 'ref' && expr.args[0] === 'first') {
      result = true;
    }
  });
  return result;
};

export const evaluateTableColumnIteratively = async (
  _realm: TRealm,
  otherColumns: Map<string, ValueTypes.ColumnLikeValue>,
  column: AST.Expression,
  rowCount: number
): Promise<ValueTypes.ColumnLikeValue> =>
  withPush(
    _realm,
    async (realm) => {
      const cells = await mapWithPrevious(
        realm,
        otherColumns,
        async function* mapper() {
          for (let index = 0; index < rowCount; index++) {
            // Make other cells available
            for (const [otherColName, otherCol] of otherColumns) {
              // eslint-disable-next-line no-await-in-loop
              realm.stack.set(otherColName, await otherCol.atIndex(index));
            }
            // make ordinal references available
            realm.stack.set('first', Value.Scalar.fromValue(index === 0));
            // eslint-disable-next-line no-await-in-loop
            yield evaluate(realm, column);
          }
        }
      );

      return Value.Column.fromValues(
        cells,
        () => ({ labels: undefined }),
        Value.defaultValue(getDefined(column.inferredType))
      );
    },
    `evaluate column iteratively \`${prettyPrintAST(column)}\``
  );

export const evaluateTableColumn = async (
  realm: TRealm,
  tableColumns: Map<string, ValueTypes.ColumnLikeValue>,
  column: AST.Expression,
  indexName: string,
  rowCount?: number
): Promise<ValueTypes.ColumnLikeValue> => {
  if (
    (refersToOtherColumnsByName(column, tableColumns) ||
      usesRecursion(column) ||
      usesOrdinalReference(column)) &&
    !requiresWholeColumn(column)
  ) {
    return evaluateTableColumnIteratively(
      realm,
      tableColumns,
      column,
      rowCount ?? 1
    );
  }

  // Evaluate the column as a whole
  return coerceTableColumnIndices(
    realm.getTypeAt(column),
    await evaluate(realm, column),
    indexName,
    rowCount
  );
};

export const evaluateTable = async (
  realm: TRealm,
  table: AST.Table
): Promise<Value.Table> => {
  const tableColumns = new Map<string, ValueTypes.ColumnLikeValue>();
  const {
    args: [tName, ...items],
  } = table;

  const tableName = getIdentifierString(tName);
  const indexName = getDefined(realm.getTypeAt(table).indexName);

  realm.stack.createNamespace(tableName);

  const tableDef = table.args[0];
  let tableLength: number | undefined = tableDef.args[1];
  const addColumn = async (name: string, value: ValueTypes.ColumnLikeValue) => {
    const valueCount = await value.rowCount();
    if (tableLength != null && valueCount !== tableLength) {
      throw new RuntimeError(
        `Error evaluating table column: expected length to be ${tableLength}`
      );
    }
    tableLength ??= valueCount;

    tableColumns.set(name, value);
    realm.stack.setNamespaced([tableName, name], value, realm.statementId);
  };

  for (const item of items) {
    if (item.type === 'table-column') {
      const [def, column] = item.args;
      const colName = getIdentifierString(def);

      // eslint-disable-next-line no-await-in-loop
      const columnData = await evaluateTableColumn(
        realm,
        tableColumns,
        column,
        indexName,
        tableLength
      );

      // eslint-disable-next-line no-await-in-loop
      await addColumn(colName, columnData);
    } else {
      throw new Error('panic: unreachable');
    }
  }

  const tableType = realm.getTypeAt(table);
  return Value.sortValue(
    tableType,
    getInstanceof(getDefined(realm.stack.get(tableName)), Value.Table)
  )[1];
};

export const getProperty = (
  object: ValueTypes.Value,
  property: string
): ValueTypes.Value => {
  if (object instanceof Value.Row) {
    return object.getCell(property);
  } else {
    return getInstanceof(object, Value.Table).getColumn(property);
  }
};
