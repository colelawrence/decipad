import { SerializedType } from '@decipad/language-interfaces';
import { AllowedPlotValue } from './plotUtils.interface';

const MAX_ROWS = 20;

export type FlipTableResult = FlipTableError | FlipTableData;

type FlipTableError = {
  readonly ok: false;
  readonly reason: string;
};

type FlipTableData = {
  readonly ok: true;
  readonly data: Array<Record<string, number | string>>;
  readonly columnNames: string[];
  readonly columnTypes: SerializedType[];
};

export const transposeTable = (
  data: Array<Record<string, AllowedPlotValue>>
): FlipTableResult => {
  if (!data) {
    return { ok: false, reason: 'Invalid table' };
  }

  const tableValue = data;
  const nrRows = tableValue.length;

  if (nrRows > MAX_ROWS) {
    return {
      ok: false,
      reason: `We do not support flipping more than ${MAX_ROWS}, but this table has ${nrRows}.`,
    };
  }

  if (nrRows === 0) {
    return {
      ok: true,
      data: [],
      columnNames: [],
      columnTypes: [],
    };
  }

  let firstColumnName: string;

  const columnNames = Object.keys(tableValue[0]);
  const firstRow = tableValue[0];
  const hasMoreThanTwoNaNs = columnNames.some((colName: string) => {
    const cellValue = firstRow[colName];
    const isNumber = typeof cellValue === 'number';
    if (!isNumber) {
      if (firstColumnName) {
        return true;
      }
      firstColumnName = colName;
    }
    return false;
  });

  if (hasMoreThanTwoNaNs) {
    return {
      ok: false,
      reason:
        'You can only flip tables when all selected columns are numbers, as otherwise we cannot plot it',
    };
  }

  const uniqueItems = Array.from(
    new Set(tableValue.map((val) => val[firstColumnName]))
  );

  const transposedData = columnNames
    .filter((colName) => colName !== firstColumnName)
    .map((colName: string) => {
      const row: { [key: string]: string | number } = { Key: colName };
      uniqueItems.forEach((item) => {
        const itemValues = tableValue.filter(
          (val) => val[firstColumnName] === item
        );
        row[String(item)] = itemValues.reduce((sum, val) => {
          const currentValForCol = val[colName];
          return (
            sum + (typeof currentValForCol === 'number' ? currentValForCol : 0)
          );
        }, 0);
      });
      return row;
    });

  const newColumnNames = ['Key', ...uniqueItems];
  const newColumnTypes = [
    { kind: 'string' },
    ...new Array(newColumnNames.length - 1).fill({
      kind: 'number',
      unit: null,
    }),
  ];

  return {
    data: transposedData,
    columnNames: newColumnNames.map((e) => String(e)),
    columnTypes: newColumnTypes,
    ok: true,
  };
};
