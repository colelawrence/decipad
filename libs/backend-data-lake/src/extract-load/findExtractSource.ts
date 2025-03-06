import { DataSource } from '../types';
import { airbyteClient } from './airByteClient';
import { getExtractSourceName } from './getExtractSourceName';

export const findExtractSource = async (
  workspaceId: string,
  sourceType: DataSource
) => {
  const expectedSourceName = getExtractSourceName(workspaceId, sourceType);
  const client = airbyteClient();
  let finished = false;
  let offset = 0;
  while (!finished) {
    // eslint-disable-next-line no-await-in-loop
    const sources = await client.listSources(offset, 100);
    const source = sources.find((s) => s.name === expectedSourceName);
    if (source) {
      return source;
    }
    if (sources.length === 0 || sources.length !== 100) {
      finished = true;
      break;
    }
    offset += 100;
  }
  return undefined;
};
