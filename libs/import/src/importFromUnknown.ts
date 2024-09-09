import type { Computer } from '@decipad/computer-interfaces';
import type { Result } from '@decipad/language-interfaces';
import { isColumn } from '@decipad/computer-utils';
import { importFromCsv } from './importFromCsv';
import { importFromUnknownJson } from './importFromUnknownJson';
import type { ImportOptions, ImportResult } from './types';
import { sanitizeRawResult } from './utils/sanitizeRawResult';

const unnestOneColumnOneCellIfNecessary = (
  result: Result.Result
): Result.Result => {
  if (
    isColumn(result.type) &&
    Array.isArray(result.value) &&
    result.value.length === 1
  ) {
    return {
      type: result.type.cellType,
      value: result.value[0],
    } as Result.Result;
  }
  return result;
};

export type RawResult = JSON | string;

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
  let rawResult: RawResult | undefined;
  let result: Result.Result;
  if (contentType?.startsWith('application/json')) {
    if (options.provider && options.provider !== 'json') {
      throw new TypeError(
        `expected provider to be 'json' when content type is application/json, but got ${options.provider}`
      );
    }
    rawResult = sanitizeRawResult(await resp.json()) as RawResult | undefined;
    result = await importFromUnknownJson(computer, rawResult, options);
  } else if (contentType?.startsWith('text/csv')) {
    if (options.provider && options.provider !== 'csv') {
      throw new TypeError(
        `expected provider to be 'csv' when content type is text/csv, but got ${options.provider}`
      );
    }
    rawResult = await resp.text();
    result = (await importFromCsv(
      computer,
      rawResult,
      options
    )) as Result.Result;
  } else {
    throw new TypeError(
      `provider ${options.provider} is not supported for content type ${contentType}`
    );
  }

  return [
    {
      meta: {
        sourceUrl: url?.toString(),
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
