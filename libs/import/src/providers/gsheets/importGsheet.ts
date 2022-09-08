import { Computer, Result } from '@decipad/computer';
import { inferTable } from '@decipad/parse';
import { ImportResult, Sheet } from '../../types';
import { ImportOptions } from '../../import';
import { getSheetMeta } from './getSheetMeta';
import { getSheetRequestDataFromUrl } from './getSheetRequestDataFromUrl';
import { getDataUrlFromSheetMeta } from './getDataUrlFromSheetUrl';

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
): Promise<Result.Result<'table'>> => {
  const body = (await resp.json()) as unknown as Sheet;
  return inferTable(computer, body, {
    ...options,
    doNotTryExpressionNumbersParse: true,
  });
};

export const importGsheet = async (
  computer: Computer,
  importURL: URL,
  options: ImportOptions
): Promise<ImportResult> => {
  const { sheetId, gid } = getSheetRequestDataFromUrl(importURL);
  const meta = await getSheetMeta(sheetId);
  const url = await getDataUrlFromSheetMeta(sheetId, gid, meta);
  let resp: Response | undefined;
  try {
    resp = await fetch(url);
  } catch (err) {
    return errorResult((err as Error).message);
  }
  if (!resp.ok) {
    return errorResult(resp.statusText);
  }
  const result = (await handleGsheetsResponse(
    computer,
    resp,
    options
  )) as Result.Result;

  return {
    meta: {
      title: meta.properties.title,
      importedAt: new Date(),
    },
    result,
  };
};
