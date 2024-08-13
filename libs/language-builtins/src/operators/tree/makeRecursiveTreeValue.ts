// eslint-disable-next-line no-restricted-imports
import { type Type, Value, buildType, compare } from '@decipad/language-types';
import { sortMap, contiguousSlices } from '@decipad/column';
import { getDefined } from '@decipad/utils';
import type { Result } from '@decipad/language-interfaces';
import { type BuiltinContextUtils } from '../../types';
import { maybeAggregateColumn } from './maybeAggregateColumn';
import { ResultMetadata } from 'libs/language-interfaces/src/Result';
import { ColumnLikeValue } from 'libs/language-interfaces/src/Value';

const getColumnMetaSlice = (
  column: ColumnLikeValue,
  start: number,
  end: number
): undefined | (() => Result.ResultMetadataColumn) => {
  return (): Result.ResultMetadataColumn => {
    const meta: ResultMetadata | undefined = column.meta?.();
    if (!meta?.labels) {
      return {
        labels: undefined,
      } satisfies Result.ResultMetadataColumn;
    }
    return {
      labels: meta?.labels.then((labels) => labels.slice(start, end + 1)),
    };
  };
};

export const makeRecursiveTreeValue = async (
  fullTable: Value.Table,
  root: Result.OneResult,
  rootAggregation: Result.Result | undefined,
  originalCardinality: number,
  table: Value.Table,
  tableType: Type,
  aggregations: Type | undefined,
  ctx: BuiltinContextUtils
): Promise<Value.Tree> => {
  const [firstColumn] = table.columns;
  if (!firstColumn) {
    return Value.Tree.empty(root);
  }

  // calculate the sort map for the first column
  const firstColumnSortMap = await sortMap(firstColumn, compare);
  // apply this sort map to all the columns
  const sortedColumns = await Promise.all(
    table.columns.map((column) =>
      Value.MappedColumn.fromColumnValueAndMap(column, firstColumnSortMap)
    )
  );
  const [firstSortedColumn, ...restSortedColumns] = sortedColumns;

  // Calculate the slices map for the first column
  // A slices map contains the start and end index of each contiguous slice
  // Each slice will constitute a node in the tree
  const slicesMap = await contiguousSlices(firstSortedColumn, compare);
  const firstColumnType = getDefined(tableType.columnTypes)[0];
  const firstColumnName = getDefined(tableType.columnNames)[0];

  // create all the children slices, which will later constitute the children nodes

  const childrenSlices = await Promise.all(
    slicesMap.map(async ([start, end]) => {
      const meta = getColumnMetaSlice(firstSortedColumn, 0, 0);
      const slicedFirstColumn = Value.Column.fromGenerator(
        () => firstColumn.values(start, end + 1),
        meta,
        'makeRecursiveTreeValue'
      );
      return {
        root: (await firstSortedColumn.atIndex(start)) ?? Value.UnknownValue,
        rootAggregation: await maybeAggregateColumn(
          ctx,
          fullTable,
          firstColumnName,
          slicedFirstColumn,
          firstColumnType,
          aggregations
        ),
        // slices each column to the corresponding slice in the first column:
        childColumns: restSortedColumns.map((column) =>
          Value.Column.fromGenerator(
            () => column.values(start, end + 1),
            meta,
            'makeRecursiveTreeValue'
          )
        ),
        originalCardinality: end - start + 1,
      };
    })
  );

  const childrenColumnNames = table.columnNames.slice(1);
  // children nodes, one for each slice
  const children = await Promise.all(
    childrenSlices.map(
      async ({ root, childColumns, originalCardinality, rootAggregation }) =>
        makeRecursiveTreeValue(
          fullTable,
          await root.getData(),
          rootAggregation,
          originalCardinality,
          Value.Table.fromNamedColumns(
            childColumns,
            childrenColumnNames,
            table.meta
          ),
          // create a new table type for the children so that we can recurse into them
          buildType.table({
            indexName: tableType.indexName,
            columnNames: childrenColumnNames,
            columnTypes: getDefined(tableType.columnTypes).slice(1),
          }),
          aggregations,
          ctx
        )
    )
  );

  return Value.Tree.from(
    root,
    rootAggregation,
    children,
    // each tree contains the column values (properly sliced) and their aggregation
    await Promise.all(
      table.columnNames.map(async (columnName, columnIndex) => ({
        name: columnName,
        aggregation: await maybeAggregateColumn(
          ctx,
          fullTable,
          columnName,
          sortedColumns[columnIndex],
          tableType?.columnTypes?.[columnIndex],
          aggregations
        ),
      }))
    ),
    originalCardinality
  );
};
