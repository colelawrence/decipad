import { getDefined } from '@decipad/utils';
import { AST } from '..';
import { refersToOtherColumnsByName } from './inference';
import { Column, ColumnLikeValue, Row, Scalar, Table, Value } from '../value';
import { mapWithPrevious } from '../interpreter/previous';
import {
  walkAst,
  getIdentifierString,
  isExpression,
  getInstanceof,
} from '../utils';
import { Realm, RuntimeError, evaluate } from '../interpreter';
import { shouldEvaluate } from './shouldEvaluate';
import { coerceTableColumnIndices } from './dimensionCoersion';
import { sortValue } from '../interpreter/sortValue';

const isRecursiveReference = (expr: AST.Expression) =>
  expr.type === 'function-call' &&
  getIdentifierString(expr.args[0]) === 'previous';

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
  tableColumns: Map<string, ColumnLikeValue>,
  column: AST.Expression,
  indexName: string,
  rowCount?: number
): Promise<ColumnLikeValue> => {
  if (
    refersToOtherColumnsByName(column, tableColumns) ||
    usesRecursion(column) ||
    usesOrdinalReference(column)
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
  otherColumns: Map<string, ColumnLikeValue>,
  column: AST.Expression,
  rowCount: number
): Promise<ColumnLikeValue> =>
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
          realm.stack.set('first', Scalar.fromValue(index === 0));
          // eslint-disable-next-line no-await-in-loop
          yield evaluate(realm, column);
        }
      }
    );

    return Column.fromValues(cells);
  });

export const evaluateTable = async (
  realm: Realm,
  table: AST.Table
): Promise<Table> => {
  const tableColumns = new Map<string, ColumnLikeValue>();
  const {
    args: [tName, ...items],
  } = table;

  const tableName = getIdentifierString(tName);
  const indexName = getDefined(realm.getTypeAt(table).indexName);

  realm.stack.createNamespace(tableName, 'function');

  const tableDef = table.args[0];
  let tableLength: number | undefined = tableDef.args[1];
  return realm.withPush(async () => {
    const addColumn = async (name: string, value: ColumnLikeValue) => {
      const valueCount = await value.rowCount();
      if (tableLength != null && valueCount !== tableLength) {
        throw new RuntimeError(
          `Error evaluating table column: expected length to be ${tableLength}`
        );
      }
      tableLength ??= valueCount;

      tableColumns.set(name, value);
      realm.stack.setNamespaced(
        [tableName, name],
        value,
        'function',
        realm.statementId
      );
    };

    for (const item of items) {
      if (item.type === 'table-column') {
        const [def, column] = item.args;
        const colName = getIdentifierString(def);

        if (!shouldEvaluate(realm, tableName, colName)) {
          // Avoid differing type and value
          continue;
        }

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
    return sortValue(
      tableType,
      getInstanceof(getDefined(realm.stack.get(tableName, 'function')), Table)
    )[1];
  });
};

export const getProperty = (object: Value, property: string): Value => {
  if (object instanceof Row) {
    return object.getCell(property);
  } else {
    return getInstanceof(object, Table).getColumn(property);
  }
};
