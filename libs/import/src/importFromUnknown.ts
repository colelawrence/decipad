import { Computer, Result } from '@decipad/computer';
import type { ImportOptions } from './import';
import { importFromArrow } from './importFromArrow';
import { importFromCsv } from './importFromCsv';
import { importFromUnknownJson } from './importFromUnknownJson';
import { ImportResult } from './types';

const importFromUnknownResponse = async (
  computer: Computer,
  resp: Response,
  options: ImportOptions,
  url?: URL
): Promise<ImportResult[]> => {
  const contentType = resp.headers.get('content-type');
  let result: Result.Result | undefined;
  if (contentType?.startsWith('application/json')) {
    result = importFromUnknownJson(await resp.json(), options);
  } else if (contentType?.startsWith('text/csv')) {
    result = (await importFromCsv(computer, resp, options)) as Result.Result;
  } else if (contentType?.startsWith('application/vnd.apache.arrow')) {
    result = await importFromArrow(resp);
  } else {
    result = {
      type: {
        kind: 'string',
      },
      value: await resp.text(),
    };
  }

  return [
    {
      meta: {
        sourceUrl: url,
      },
      result,
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

export const importFromUnknown = (
  computer: Computer,
  source: URL | Response,
  options: ImportOptions
): Promise<ImportResult[]> => {
  if (source instanceof URL) {
    return importFromUnknownUrl(computer, source, options);
  }
  return importFromUnknownResponse(computer, source as Response, options);
};
