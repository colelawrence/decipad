import { ExternalData } from '..';

export default async function defaultFetch(
  url: string
): Promise<ExternalData.FetchResult> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(await response.text());
  }
  const result: AsyncIterable<Uint8Array> = {
    [Symbol.asyncIterator]() {
      let replied = false;
      return {
        async next() {
          if (replied) {
            return { done: true, value: undefined };
          }

          // TODO: for now, we fetch the entire document at once.
          // In the future, we should do it chunk by chunk.
          const result = new Uint8Array(await response.arrayBuffer());
          replied = true;

          return { value: result };
        },
      };
    },
  };
  const contentType = response.headers.get('Content-Type');

  return {
    contentType,
    result,
  };
}
