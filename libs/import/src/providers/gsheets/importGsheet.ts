import { Computer, Result } from '@decipad/computer';
import { inferTable } from '@decipad/parse';
import { getDefined } from '@decipad/utils';
import { ImportResult, Sheet } from '../../types';
import { ImportOptions } from '../../import';
import { getSheetMeta } from './getSheetMeta';
import { getSheetRequestDataFromUrl } from './getSheetRequestDataFromUrl';
import { getDataUrlFromSheetMeta } from './getDataUrlFromSheetUrl';
import { trimSheet } from '../../utils/trimSheet';
import { findAllIslands } from '../../utils/sheetIslands';

const sumLength = <T>(acc: number, col: T[]): number => {
  return acc + col.length;
};

const errorResult = (err: string): ImportResult => {
  return {
    result: {
      type: {
        kind: 'type-error',
        errorCause: {
          errType: 'free-form',
          message: err,
        },
      },
      value: Result.UnknownValue.getData(),
    },
  };
};

const handleGsheetsResponse = async (
  computer: Computer,
  resp: Response,
  options: ImportOptions
): Promise<Result.Result> => {
  const { identifyIslands = false, maxCellCount } = options;
  const body = (await resp.json()) as unknown as Sheet;
  if (maxCellCount) {
    const cellCount = body.values.reduce(sumLength, 0);
    if (cellCount > maxCellCount) {
      return errorResult(`Too many cells to import. maximum is ${maxCellCount}`)
        .result;
    }
  }
  const trimmedBody = identifyIslands ? body : trimSheet(body);
  return inferTable(computer, trimmedBody, {
    ...options,
    doNotTryExpressionNumbersParse: true,
  }) as Result.Result;
};

const loadSheet =
  (computer: Computer, options: ImportOptions) => async (url: URL) => {
    return handleGsheetsResponse(computer, await fetch(url), options);
  };

const loadAllSubsheets = async (
  computer: Computer,
  importURL: URL,
  options: ImportOptions
): Promise<ImportResult[]> => {
  const { sheetId } = getSheetRequestDataFromUrl(importURL);
  const meta = await getSheetMeta(sheetId);
  const loader = loadSheet(computer, options);
  const results: ImportResult[] = [];
  for (const subsheet of meta.sheets) {
    const url = getDataUrlFromSheetMeta(
      meta.spreadsheetId,
      subsheet.properties.sheetId,
      meta
    );
    try {
      // eslint-disable-next-line no-await-in-loop
      const result = await loader(url);
      const subMeta: ImportResult['meta'] = {
        title: subsheet.properties.title,
        importedAt: new Date(),
        sourceUrl: url,
        sheetId,
        gid: subsheet.properties.sheetId,
        sourceMeta: meta,
      };
      results.push({
        meta: subMeta,
        result: result as Result.Result,
      });
    } catch (err) {
      results.push(errorResult((err as Error).message));
    }
  }
  return results;
};

const importGsheetIslands = async (
  computer: Computer,
  importURL: URL,
  options: ImportOptions
): Promise<ImportResult[]> => {
  return (await loadAllSubsheets(computer, importURL, options)).flatMap(
    (result) => findAllIslands(getDefined(result.meta?.gid).toString(), result)
  );
};

const importOneGsheet = async (
  computer: Computer,
  importURL: URL,
  options: ImportOptions
) => {
  const { sheetId, gid } = getSheetRequestDataFromUrl(importURL);
  const meta = await getSheetMeta(sheetId);
  const url = getDataUrlFromSheetMeta(sheetId, gid, meta);
  let resp: Response | undefined;
  try {
    resp = await fetch(url);
  } catch (err) {
    return [errorResult((err as Error).message)];
  }
  if (!resp.ok) {
    return [errorResult(resp.statusText || (await resp.text()))];
  }
  const result = (await handleGsheetsResponse(
    computer,
    resp,
    options
  )) as Result.Result;

  const importResult = {
    meta: {
      title: meta.properties.title,
      importedAt: new Date(),
    },
    result,
  };

  return [importResult];
};

export const importGsheet = async (
  computer: Computer,
  importURL: URL,
  options: ImportOptions
): Promise<ImportResult[]> => {
  return (options.identifyIslands ? importGsheetIslands : importOneGsheet)(
    computer,
    importURL,
    options
  );
};
