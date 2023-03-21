import { captureException, Computer, Result } from '@decipad/computer';
import { inferTable } from '@decipad/parse';
import { getDefined } from '@decipad/utils';
import { ImportResult, Sheet } from '../../types';
import { ImportOptions, ImportParams } from '../../import';
import { getSheetMeta } from './getSheetMeta';
import { getSheetRequestDataFromUrl } from './getSheetRequestDataFromUrl';
import { getDataUrlFromSheetMeta } from './getDataUrlFromSheetUrl';
import { trimSheet } from '../../utils/trimSheet';
import { findAllIslands } from '../../utils/sheetIslands';
import { request } from '../../http/request';

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

const getSheet = (response: unknown): Sheet => {
  try {
    if (
      typeof response !== 'object' ||
      response == null ||
      !('body' in response)
    ) {
      throw new TypeError('response does not have a body');
    }
    const { body } = response;
    if (typeof body !== 'object' || body == null || !('values' in body)) {
      throw new TypeError('body is not an object');
    }
    if (!Array.isArray(body.values)) {
      throw new TypeError('body.values is not an array');
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error caught while parsing gsheet return value', response);
    captureException(err as Error);
    throw err;
  }
  return response.body as Sheet;
};

const handleGsheetsResponse = async (
  computer: Computer,
  resp: unknown,
  options: ImportOptions
): Promise<Result.Result> => {
  const { identifyIslands = false, maxCellCount } = options;
  const body = getSheet(resp);
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
  (params: ImportParams, options: ImportOptions) => async (url: URL) => {
    return handleGsheetsResponse(
      params.computer,
      await request(url, true, params),
      options
    );
  };

const loadAllSubsheets = async (
  params: ImportParams,
  options: ImportOptions
): Promise<ImportResult[]> => {
  const { sheetId } = getSheetRequestDataFromUrl(params.url);
  const meta = await getSheetMeta(sheetId, params);
  const loader = loadSheet(params, options);
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
  params: ImportParams,
  options: ImportOptions
): Promise<ImportResult[]> => {
  return (await loadAllSubsheets(params, options)).flatMap((result) =>
    findAllIslands(getDefined(result.meta?.gid).toString(), result)
  );
};

const importOneGsheet = async (
  params: ImportParams,
  options: ImportOptions
) => {
  const { sheetId, gid } = getSheetRequestDataFromUrl(params.url);
  const meta = await getSheetMeta(sheetId, params);
  const url = getDataUrlFromSheetMeta(sheetId, gid, meta);
  try {
    const resp = await request(url, true, params);
    const result = (await handleGsheetsResponse(
      params.computer,
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
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error importing one Gsheet', err);
    captureException(err as Error);
    return [errorResult((err as Error).message)];
  }
};

export const importGsheet = async (
  params: ImportParams,
  options: ImportOptions
): Promise<ImportResult[]> =>
  (options.identifyIslands ? importGsheetIslands : importOneGsheet)(
    params,
    options
  );
