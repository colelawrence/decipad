import { Computer, Result } from '@decipad/computer';
import type { ImportOptions } from './import';
import { importFromArrow } from './importFromArrow';
import { importFromCsv } from './importFromCsv';
import { importFromUnknownJson } from './importFromUnknownJson';
import { ImportResult } from './types';

const unnestOneColumnOneCellIfNecessary = (
  result: Result.Result
): Result.Result => {
  if (
    result.type.kind === 'column' &&
    Array.isArray(result.value) &&
    result.value.length === 1
  ) {
    return {
      type: result.type.cellType,
      value: result.value[0],
    };
  }
  return result;
};

const importFromUnknownResponse = async (
  computer: Computer,
  resp: Response,
  options: ImportOptions,
  url?: URL
): Promise<ImportResult[]> => {
  if (!resp.ok) {
    throw new Error(
      `failed to fetch from ${url} with response ${resp.status}: ${resp.statusText}`
    );
  }
  const contentType = resp.headers.get('content-type');
  let rawResult: ImportResult['rawResult'] | undefined;
  let result: Result.Result;
  if (contentType?.startsWith('application/json')) {
    rawResult = await resp.json();
    result = importFromUnknownJson(rawResult, options);
  } else if (contentType?.startsWith('text/csv')) {
    rawResult = await resp.text();
    result = (await importFromCsv(
      computer,
      rawResult,
      options
    )) as Result.Result;
  } else if (contentType?.startsWith('application/vnd.apache.arrow')) {
    result = await importFromArrow(resp);
  } else {
    rawResult = await resp.text();
    result = {
      type: {
        kind: 'string',
      },
      value: rawResult,
    };
  }

  return [
    {
      meta: {
        sourceUrl: url,
      },
      result: unnestOneColumnOneCellIfNecessary(result),
      rawResult,
      loading: false,
    },
  ];
};

const importFromUnknownUrl = async (
  computer: Computer,
  url: URL,
  options: ImportOptions = {}
): Promise<ImportResult[]> => {
  try {
    return importFromUnknownResponse(computer, await fetch(url), options, url);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Error making request to ${url}`, err);
    throw err;
  }
};

export const importFromUnknown = async (
  computer: Computer,
  source: URL | Response,
  options: ImportOptions = {}
): Promise<ImportResult[]> => {
  if (source instanceof URL) {
    const res = await importFromUnknownUrl(computer, source, options);
    return res;
  }
  return importFromUnknownResponse(computer, source as Response, options);
};
