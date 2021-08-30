import { ExternalData } from '..';

interface JsonError {
  message: string;
  code: number;
  stack: string;
}

class HttpError extends Error {
  code = 500;
}

async function errorFromResponse(response: Response): Promise<Error> {
  const text = await response.text();
  let errorJson: JsonError | undefined;
  try {
    errorJson = JSON.parse(text);
  } catch (err) {
    // do nothing
  }
  if (errorJson) {
    const err = new HttpError(errorJson.message || errorJson.toString());
    err.code = errorJson.code;
    err.stack = errorJson.stack;
    return err;
  }
  return new Error(text);
}

export default async function defaultFetch(
  url: string
): Promise<ExternalData.FetchResult> {
  const response = await fetch(url);
  if (!response.ok) {
    throw await errorFromResponse(response);
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
