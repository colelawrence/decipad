// eslint-disable-next-line no-restricted-imports
import { buildType } from '@decipad/language-types';
import { getDefined } from '@decipad/utils';
import { type FullBuiltinSpec } from '../../interfaces';

export const treeFunctor: FullBuiltinSpec['functorNoAutomap'] = async (
  [table, _filters, _roundings, _aggregations],
  _,
  utils
) => {
  return (await table.isTable()).mapType(async (table) => {
    let columnTypes = getDefined(table.columnTypes);
    const columnNames = getDefined(table.columnNames);

    if (_filters && (await _filters.isNothing()).errorCause) {
      const filters = await _filters.isTable();
      if (filters.errorCause) {
        return filters;
      }

      const filteredColumnTypes = await Promise.all(
        columnTypes.map(async (type, index) => {
          const columnName = columnNames[index];
          const columnIndex = getDefined(
            filters.columnNames,
            'no column names'
          ).indexOf(columnName);
          if (columnIndex < 0) {
            return type;
          }
          const columnCellType = await getDefined(
            filters.columnTypes,
            'no column types'
          )[columnIndex].isFunction();
          if (columnCellType.errorCause) {
            return columnCellType;
          }
          const returnType = await utils.callFunctor(
            getDefined(columnCellType.functionBody, 'no function body'),
            getDefined(
              columnCellType.functionArgNames,
              'no function arg names'
            ),
            [buildType.column(type, type.indexedBy)]
          );
          return returnType.cellType ?? returnType;
        })
      );

      if (filteredColumnTypes.some((t) => t?.errorCause)) {
        return getDefined(filteredColumnTypes.find((t) => t?.errorCause));
      }
    }

    if (_roundings && (await _roundings.isNothing()).errorCause) {
      const roundings = await _roundings.isTable();
      if (roundings.errorCause) {
        return roundings;
      }
      columnTypes = await Promise.all(
        columnTypes.map(async (type, index) => {
          const columnName = columnNames[index];
          const columnIndex = getDefined(roundings.columnNames).indexOf(
            columnName
          );
          if (columnIndex < 0) {
            return type;
          }
          const columnCellType = await getDefined(roundings.columnTypes)[
            columnIndex
          ].isFunction();
          if (columnCellType.errorCause) {
            return columnCellType;
          }
          const returnType = await utils.callFunctor(
            getDefined(columnCellType.functionBody),
            getDefined(columnCellType.functionArgNames),
            [buildType.column(type, type.indexedBy)]
          );
          return returnType.cellType ?? returnType;
        })
      );
    }

    if (_aggregations && (await _aggregations.isNothing()).errorCause) {
      const aggregations = await _aggregations.isTable();
      if (aggregations.errorCause) {
        return aggregations;
      }
    }

    return buildType.tree({
      columnTypes,
      columnNames,
    });
  });
};
