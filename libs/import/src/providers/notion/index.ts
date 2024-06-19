import type { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import type { Provider } from '../types';
import { request } from '../../http/request';
import { importFromNotion } from '../../importFromNotion';
import { merge } from '@decipad/utils';
import { columnTypeCoercionsToRec } from '../../utils/columnTypeCoersionsToRec';
import { importFromUnknownJson } from '../../importFromUnknownJson';

function recordToArray<T>(
  record: Record<number, T> | undefined
): Array<T | undefined> {
  if (record == null) {
    return [];
  }

  let highest = 0;
  for (const item of Object.keys(record)) {
    if (highest < Number(item)) {
      highest = Number(item);
    }
  }

  const arr = Array<T>(highest);

  for (const [index, value] of Object.entries(record)) {
    arr[Number(index)] = value;
  }

  return arr;
}

export const notion: Provider = {
  name: 'notion',
  matchUrl: () => false,
  async import(params, options) {
    // gots to do this!

    const response = await request(params.url, true, params);

    const [importedNotion, cohersions] = importFromNotion(
      // fml
      response.body as object as QueryDatabaseResponse
    );

    const mergedTypeMappings = merge(
      recordToArray(options.columnTypeCoercions),
      cohersions
    );

    // lol, go from A to B to go to A again...
    // pls refactor this little thing
    const deciResult = await importFromUnknownJson(
      params.computer,
      importedNotion,
      {
        columnTypeCoercions: columnTypeCoercionsToRec(mergedTypeMappings),
      }
    );

    return [
      {
        result: deciResult,
        rawResult: JSON.stringify(importedNotion),
        loading: false,
      },
    ];
  },
};
