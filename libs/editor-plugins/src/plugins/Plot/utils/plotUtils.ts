import type { BasePlotProps } from '@decipad/editor-types';
import { formatResult } from '@decipad/format';
import type { Result, SerializedType } from '@decipad/language-interfaces';
import type DeciNumber from '@decipad/number';
import {
  Unit,
  materializeResult,
  safeNumberForPrecision,
} from '@decipad/remote-computer';
import { PlotData } from './plotUtils.interface';

function relevantColumnNames(displayProps: BasePlotProps): string[] {
  return [
    displayProps.xColumnName ?? '',
    ...(displayProps.yColumnNames ?? []),
    displayProps.sizeColumnName ?? '',
    displayProps.labelColumnName ?? '',
  ].filter(Boolean);
}

function rangeToString(
  range: Result.ResultRange,
  rangeOf: SerializedType
): string {
  const [from, to] = range;

  return `${formatResult('en-US', from, rangeOf)} -> ${formatResult(
    'en-US',
    to,
    rangeOf
  )}`;
}

function toPlotColumn(
  type: SerializedType,
  column: Array<Result.OneResult>
): Array<number | string> | null {
  if (type.kind === 'number') {
    return (column as Array<DeciNumber>).map((f) => {
      const [rounded] = safeNumberForPrecision(
        Unit.convertToMultiplierUnit(f, type.unit)
      );
      return rounded;
    });
  }

  switch (type.kind) {
    case 'date':
      return (column as Array<bigint>).map((d) =>
        formatResult('en-US', d, type)
      );
    case 'boolean':
      return (column as Array<boolean>).map((d) => (d ? 'True' : 'False'));
    case 'string':
      return column as Array<string>;
    case 'range':
      return (column as Array<Result.ResultRange>).map((d) =>
        rangeToString(d, type.rangeOf)
      );
    default:
      return null;
  }
}

function makeWide(
  table: Record<string, Array<number | string>>
): Array<Record<string, number | string>> {
  const rows: Array<Array<[string, number | string]>> = [];
  let first = true;
  for (const [key, values] of Object.entries(table)) {
    if (!key || !values) {
      continue;
    }
    // eslint-disable-next-line no-loop-func
    values.forEach((value, index) => {
      if (first) {
        rows.push([[key, value]]);
      } else {
        const row = rows[index];
        row.push([key, value]);
      }
    });
    first = false;
  }
  return rows.map((row) => Object.fromEntries(row));
}

export async function resultToPlotResultData(
  _result: undefined | Result.Result,
  displayProps: BasePlotProps
): Promise<
  | undefined
  | {
      data: PlotData;
      unfiltered: PlotData;
    }
> {
  if (!_result || _result.type.kind !== 'table') {
    return;
  }
  const type = _result?.type;
  if (!type || type.kind !== 'table') {
    return;
  }

  const allColumnNames = _result.type.columnNames;
  const result = await materializeResult(_result);
  const value = result?.value;

  if (!value) {
    return;
  }
  const tableValue = value as Result.ResultMaterializedTable;
  const columnNames = relevantColumnNames(displayProps);
  const columnsAllTypesAndResults: Array<[SerializedType, Result.OneResult[]]> =
    allColumnNames.map((columnName): [SerializedType, Result.OneResult[]] => {
      const index = type.columnNames.indexOf(columnName);
      return [type.columnTypes[index], tableValue[index]];
    });
  const returnValue: Record<string, Array<number | string>> = {};
  const returnValueUnfiltered: Record<string, Array<number | string>> = {};
  allColumnNames.forEach((columnName, index) => {
    const [columnType, values] = columnsAllTypesAndResults[index];
    const plotValueThatIsAcceptable = toPlotColumn(columnType, values);
    if (plotValueThatIsAcceptable) {
      returnValueUnfiltered[columnName] = plotValueThatIsAcceptable;
      if (columnNames.includes(columnName)) {
        returnValue[columnName] = plotValueThatIsAcceptable;
      }
    }
  });

  return {
    unfiltered: { table: makeWide(returnValueUnfiltered) },
    data: { table: makeWide(returnValue) },
  };
}
