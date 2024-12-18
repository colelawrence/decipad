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
import { CURRENT_COLUMN_SYMBOL } from '../interpreter/previous';
import { evaluate } from '../interpreter';
import { coerceTableColumnIndices } from './dimensionCoersion';
import { requiresWholeColumn } from './requiresWholeColumn';
import { isPrevious } from '../utils/isPrevious';
import { withPush, type TRealm } from '../scopedRealm';
import { prettyPrintAST } from '../parser/utils';
import { all } from '@decipad/generator-utils';
import { rowIterableFromColumns } from './rowIterable';

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

/**
 * Helper to wrap a generator call around the `first` keyword
 */
async function* asFirstRow<T>(realm: TRealm, fn: () => AsyncGenerator<T>) {
  realm.stack.set('first', Value.Scalar.fromValue(true));
  yield* fn();
  realm.stack.set('first', Value.Scalar.fromValue(false));
}

/**
 * Sets the current row as the column values (adjacent rows),
 * and manages previousRow for the next iteration.
 */
async function withPreviousAndLocalColumns(
  realm: TRealm,
  rowValue: Map<string | symbol, ValueTypes.Value>,
  fn: () => Promise<ValueTypes.Value>
) {
  realm.stack.setMulti(rowValue as Map<string, ValueTypes.Value>);
  const cell = await fn();

  rowValue.set(CURRENT_COLUMN_SYMBOL, cell);
  realm.previousRow = rowValue;

  return cell;
}

export const evaluateTableColumnIteratively = async (
  _realm: TRealm,
  otherColumns: Map<string, ValueTypes.ColumnLikeValue>,
  column: AST.Expression,
  rowCount: number
): Promise<ValueTypes.ColumnLikeValue> =>
  withPush(
    _realm,
    async (realm) => {
      async function* mapper() {
        const rowGenerator = rowIterableFromColumns(otherColumns)();
        realm.previousRow = undefined;

        const evaluatorFunction = async () => evaluate(realm, column);

        yield* asFirstRow(realm, async function* withFirstRow() {
          const firstRow = await rowGenerator.next();
          if (firstRow.done) {
            return;
          }

          yield withPreviousAndLocalColumns(
            realm,
            firstRow.value,
            evaluatorFunction
          );
        });

        let counter = 1;

        while (counter < rowCount) {
          // eslint-disable-next-line no-await-in-loop
          const currentRow = await rowGenerator.next();
          if (currentRow.done) {
            break;
          }

          yield withPreviousAndLocalColumns(
            realm,
            currentRow.value,
            evaluatorFunction
          );
          counter++;
        }
      }

      const cells = await all(mapper());

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
  const tableType = realm.getTypeAt(table);

  const indexName = getDefined(tableType.indexName);

  realm.stack.createNamespace(tableName);

  let tableLength: number | undefined = tableType.rowCount;

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
