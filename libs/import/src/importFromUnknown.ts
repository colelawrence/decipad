import { Computer, Result } from '@decipad/computer';
import type { ImportOptions } from './import';
import { importFromArrow } from './importFromArrow';
import { importFromCsv } from './importFromCsv';
import { importFromUnknownJson } from './importFromUnknownJson';

const importFromUnknownResponse = async (
  computer: Computer,
  resp: Response,
  options: ImportOptions
): Promise<Result.Result> => {
  const contentType = resp.headers.get('content-type');
  if (contentType?.startsWith('application/json')) {
    return importFromUnknownJson(await resp.json(), options);
  }
  if (contentType?.startsWith('text/csv')) {
    return importFromCsv(computer, resp, options) as Promise<Result.Result>;
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
  computer: Computer,
  url: URL,
  options: ImportOptions = {}
): Promise<Result.Result> => {
  try {
    return importFromUnknownResponse(computer, await fetch(url), options);
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
): Promise<Result.Result> => {
  if (source instanceof URL) {
    return importFromUnknownUrl(computer, source, options);
  }
  return importFromUnknownResponse(computer, source as Response, options);
};
