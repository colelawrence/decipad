import { NotebookResults, Result } from '@decipad/remote-computer';
import { ExportedResult } from '.';
import { formatUnit } from '@decipad/format';
import { ColumnValue, FormattedResult, VarnameExportedResult } from './types';

async function getSingleResult(
  _value: Result.Result['value'],
  _type: Result.Result['type']
): Promise<FormattedResult | undefined> {
  const { kind } = _type;
  const result: Result.Result = { value: _value, type: _type };

  if (kind === 'string') {
    const { value } = result as Result.Result<'string'>;
    return {
      type: 'string',
      value,
    };
  }

  if (kind === 'number') {
    const { value, type } = result as Result.Result<'number'>;
    let adjustedValue = value;

    //
    // If you have `kilometers`, the unit is `meter` with a multiplier of 1000.
    // So we have to do an inverse operation based on this multiplier,
    // to bring out value to the expected result.
    //
    // Test this out by commenting out this loop and checking the spec file.
    //
    for (const unit of type.unit ?? []) {
      adjustedValue = adjustedValue.div(unit.multiplier);
    }

    return {
      type: 'number',
      value: Number(adjustedValue.toString()),
      unit: type.unit ? formatUnit('eu-GB', type.unit, value, true) : null,
    };
  }

  if (kind === 'column') {
    const { value, type } = result as Result.Result<'materialized-column'>;

    const colCells: Array<FormattedResult | undefined> = await Promise.all(
      value.map((cell) => getSingleResult(cell, type.cellType))
    );

    return {
      type: 'column',
      value: colCells.filter((c): c is FormattedResult => c != null),
    };
  }

  if (kind === 'table') {
    const { value: columns, type } =
      result as Result.Result<'materialized-table'>;

    const colValues: Array<ColumnValue> = await Promise.all(
      columns.map(async (col, i) => {
        const colType = type.columnTypes[i];

        const colCells: Array<FormattedResult | undefined> = await Promise.all(
          col.map((cell) => getSingleResult(cell, colType))
        );

        return {
          type: 'column',
          value: colCells.filter((c): c is FormattedResult => c != null),
        };
      })
    );

    return {
      type: 'table',
      value: colValues,
    };
  }

  return undefined;
}

//
// Export program takes a record of blockId -> results.
// Which you can get from `computer.results.value`
//
// And a nice JSON object - meant for sending to API is returned.
// Take a look at `types.ts` to see what to expect.
//
// @example
// ```ts
// const results = await exportProgram(computer.results.value, computer.getSymbolDefinedInBlock.bind(computer));
// ```
// @note we use .bind(computer), because computer is a class and we want to
// bind `this` to be the instant of that object.
//
export async function exportProgram(
  results: NotebookResults,
  getNamesCallback: (blockId: string) => string | undefined
): Promise<Array<ExportedResult>> {
  const toExport: Array<ExportedResult | undefined> = await Promise.all(
    Object.entries(results.blockResults).map(async ([blockId, result]) => {
      if (result.type === 'identified-error') return;

      const res = await getSingleResult(
        result.result.value,
        result.result.type
      );

      if (!res) return;

      return {
        id: blockId,
        varName: getNamesCallback(blockId),
        result: res,
      };
    })
  );

  return toExport.filter((t): t is ExportedResult => t != null);
}

export async function exportProgramByVarname(
  results: NotebookResults,
  getNamesCallback: (blockId: string) => string | undefined
): Promise<VarnameExportedResult> {
  const values = await exportProgram(results, getNamesCallback);

  const varnameValues: VarnameExportedResult = {};
  for (const value of values) {
    if (!value.varName) continue;
    varnameValues[value.varName] = { id: value.id, result: value.result };
  }

  return varnameValues;
}
