import { importFromUnknownJson } from '../../importFromUnknownJson';
import type { ImportParams, ImportResult } from '../../types';
import { columnTypeCoercionsToRec } from '../../utils/columnTypeCoersionsToRec';
import type { Provider } from '../types';

type FetchQueryRes =
  | {
      type: 'success';
      data: object;
    }
  | {
      type: 'error';
      error: string;
      message: string;
      statusCode: number;
    };

export async function fetchQuery(
  url: string,
  query: string
): Promise<FetchQueryRes | undefined> {
  try {
    const queryRes = await fetch(url, {
      body: query,
      method: 'POST',
    });

    const res = await queryRes.json();
    if ('error' in res) {
      return { type: 'error', ...res };
    }
    return { type: 'success', data: res };
  } catch (err) {
    return undefined;
  }
}

const getUrl = (params: ImportParams): string => {
  if (params.proxy != null) {
    const url = new URL(params.proxy);
    url.searchParams.set('url', params.url.toString());

    return url.toString();
  }

  return params.url.toString();
};

export const mysql: Provider = {
  name: 'mysql',
  matchUrl: (url) => url.protocol === 'mysql:',
  async import(params, options) {
    if (options.query == null) {
      throw new Error('MySQL requires query to be present');
    }

    const fetchRes = await fetchQuery(getUrl(params), options.query);
    if (fetchRes == null || fetchRes.type === 'error') {
      throw new Error(
        `An error has occured whilst fetching\n${JSON.stringify(
          fetchRes,
          null,
          2
        )}`
      );
    }

    const imported = await importFromUnknownJson(
      params.computer,
      fetchRes.data,
      {
        columnTypeCoercions: columnTypeCoercionsToRec(
          options.columnTypeCoercions ?? {}
        ),
      }
    );

    const res: ImportResult = {
      meta: undefined,
      result: imported,
      rawResult: JSON.stringify(fetchRes.data),
      loading: false,
    };

    return [res];
  },
};
