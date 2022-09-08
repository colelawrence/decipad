import { Computer, Result } from '@decipad/computer';
import { inferTable } from '@decipad/parse';
import { getDataUrlFromSheetUrl } from './getDataUrlFromSheetUrl';
import { Sheet } from '../../types';
import { ImportOptions } from '../../import';

const errorResult = (err: string): Result.Result => {
  return {
    type: {
      kind: 'type-error',
      errorCause: {
        errType: 'free-form',
        message: err,
      },
    },
    value: Result.UnknownValue.getData(),
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

const importGsheets = async (
  computer: Computer,
  _url: URL,
  options: ImportOptions
): Promise<Result.Result> => {
  const url = await getDataUrlFromSheetUrl(_url);
  let resp: Response | undefined;
  try {
    resp = await fetch(url);
  } catch (err) {
    return errorResult((err as Error).message);
  }
  if (!resp.ok) {
    return errorResult(resp.statusText);
  }
  return handleGsheetsResponse(
    computer,
    resp,
    options
  ) as Promise<Result.Result>;
};

export const gsheets = {
  name: 'gsheets',
  matchUrl: (url: URL): boolean => url.hostname === 'docs.google.com',
  import: importGsheets,
};
