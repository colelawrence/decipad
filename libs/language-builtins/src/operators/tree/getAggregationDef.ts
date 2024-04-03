// eslint-disable-next-line no-restricted-imports
import { AST, Type, Value } from '@decipad/language-types';
import { getDefined } from '@decipad/utils';

export type GetAggregationDefResult = {
  body: AST.Block;
  argNames: string[];
  columnIndexInFullTable: number;
};

export const getAggregationDef = (
  fullTable: Value.Table,
  columnName: string,
  aggregations?: Type
): GetAggregationDefResult | undefined => {
  if (!aggregations?.columnNames || !aggregations?.columnTypes) {
    return;
  }
  const columnIndexInFullTable = fullTable.columnNames.findIndex(
    (name) => name === columnName
  );
  if (columnIndexInFullTable < 0) {
    return;
  }

  const aggregationColumnIndex = getDefined(aggregations.columnNames).indexOf(
    columnName
  );
  if (aggregationColumnIndex >= 0) {
    const columnCellType = getDefined(aggregations.columnTypes)[
      aggregationColumnIndex
    ];
    const body = getDefined(
      columnCellType.functionBody,
      'aggregation column should be of type function'
    );
    const argNames = getDefined(
      columnCellType.functionArgNames,
      'function arg names'
    );

    return { body, argNames, columnIndexInFullTable };
  }

  return undefined;
};
