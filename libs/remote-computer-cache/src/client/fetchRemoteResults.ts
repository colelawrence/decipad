import { fetch } from '@decipad/fetch';

export const fetchRawRemoteResults = async (
  notebookId: string
): Promise<ArrayBuffer> => {
  const fetchRemoteSignedUrlResult = await fetch(
    `/api/pads/${encodeURIComponent(notebookId)}/computercache`
  );
  if (!fetchRemoteSignedUrlResult.ok) {
    throw new Error(
      `Failed to fetch remote cache for notebook ${notebookId}: ${fetchRemoteSignedUrlResult.statusText}`
    );
  }

  const { url } = await fetchRemoteSignedUrlResult.json();

  const cacheFetchResult = await fetch(url);
  if (!cacheFetchResult.ok) {
    throw new Error(
      `Failed to fetch remote cache for notebook ${notebookId}: ${cacheFetchResult.statusText}`
    );
  }

  return cacheFetchResult.arrayBuffer();
};

export const parseRawRemoteResults = async <T>(
  rawResults: ArrayBuffer,
  expectedProtocolVersion: number,
  decode: (buffer: DataView, offset: number) => Promise<T>
): Promise<T | undefined> => {
  const dataView = new DataView(rawResults);
  const remoteProtocolVersion = dataView.getUint32(0); // codec version
  if (remoteProtocolVersion !== expectedProtocolVersion) {
    return undefined;
  }
  return decode(dataView, 4);
};
