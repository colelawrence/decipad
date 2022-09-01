import { Result } from '@decipad/computer';
import { getDataUrlFromSheetUrl } from './getDataUrlFromSheetUrl';
import { toTable } from '../../utils/toTable';
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
  resp: Response,
  options: ImportOptions
): Promise<Result.Result<'table'>> => {
  const body = (await resp.json()) as unknown as Sheet;
  return toTable(body, options);
};

const importGsheets = async (
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
  return handleGsheetsResponse(resp, options) as Promise<Result.Result>;
};

export const gsheets = {
  name: 'gsheets',
  matchUrl: (url: URL): boolean => url.hostname === 'docs.google.com',
  import: importGsheets,
};
