import { getDefined, getInstanceof } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import { AST, RuntimeError, Value } from '@decipad/language-types';
import { refersToOtherColumnsByName } from './inference';
import { mapWithPrevious } from '../interpreter/previous';
import { walkAst, getIdentifierString, isExpression } from '../utils';
import { Realm, evaluate } from '../interpreter';
import { coerceTableColumnIndices } from './dimensionCoersion';
import { requiresWholeColumn } from './requiresWholeColumn';
import { isPrevious } from '../utils/isPrevious';

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

export const evaluateTableColumn = async (
  realm: Realm,
  tableColumns: Map<string, Value.ColumnLikeValue>,
  column: AST.Expression,
  indexName: string,
  rowCount?: number
): Promise<Value.ColumnLikeValue> => {
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

export const evaluateTableColumnIteratively = async (
  realm: Realm,
  otherColumns: Map<string, Value.ColumnLikeValue>,
  column: AST.Expression,
  rowCount: number
): Promise<Value.ColumnLikeValue> =>
  realm.withPush(async () => {
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
      Value.defaultValue(getDefined(column.inferredType))
    );
  });

export const evaluateTable = async (
  realm: Realm,
  table: AST.Table
): Promise<Value.Table> => {
  const tableColumns = new Map<string, Value.ColumnLikeValue>();
  const {
    args: [tName, ...items],
  } = table;

  const tableName = getIdentifierString(tName);
  const indexName = getDefined(realm.getTypeAt(table).indexName);

  realm.stack.createNamespace(tableName);

  const tableDef = table.args[0];
  let tableLength: number | undefined = tableDef.args[1];
  const addColumn = async (name: string, value: Value.ColumnLikeValue) => {
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
  object: Value.Value,
  property: string
): Value.Value => {
  if (object instanceof Value.Row) {
    return object.getCell(property);
  } else {
    return getInstanceof(object, Value.Table).getColumn(property);
  }
};
