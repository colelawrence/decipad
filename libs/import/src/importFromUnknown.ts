import { Result } from '@decipad/computer';
import type { ImportOptions } from './import';
import { importFromArrow } from './importFromArrow';
import { importFromCsv } from './importFromCsv';
import { importFromUnknownJson } from './importFromUnknownJson';

const importFromUnknownResponse = async (
  resp: Response,
  options: ImportOptions
): Promise<Result.Result> => {
  const contentType = resp.headers.get('content-type');
  if (contentType?.startsWith('application/json')) {
    return importFromUnknownJson(await resp.json(), options);
  }
  if (contentType?.startsWith('text/csv')) {
    return importFromCsv(resp, options);
  }
  if (contentType?.startsWith('application/vnd.apache.arrow')) {
    return importFromArrow(resp);
  }

  return {
    type: {
      kind: 'string',
    },
    value: await resp.text(),
  };
};

const importFromUnknownUrl = async (
  url: URL,
  options: ImportOptions = {}
): Promise<Result.Result> => {
  try {
    return importFromUnknownResponse(await fetch(url), options);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`Error making request to ${url}`, err);
    throw err;
  }
};

export const importFromUnknown = (
  source: URL | Response,
  options: ImportOptions
): Promise<Result.Result> => {
  if (source instanceof URL) {
    return importFromUnknownUrl(source, options);
  }
  return importFromUnknownResponse(source as Response, options);
};
