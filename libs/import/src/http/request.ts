import fetch from 'isomorphic-fetch';

interface ErrorResponseBody {
  error: {
    code: number;
    message: string;
    status: string;
  };
}

interface RequestResponse {
  contentType?: string | null;
  statusCode?: number;
  body: string | JSON;
}

export async function request(
  url: URL,
  json = false,
  { proxy }: { proxy?: URL } = {}
): Promise<RequestResponse> {
  const fetchOptions = {
    method: 'GET',
    headers: {
      Referer: global.location.toString(),
    },
  };
  const fetchUrl = proxy
    ? `${proxy.toString()}?url=${encodeURIComponent(url.toString())}`
    : url.toString();
  const response = await fetch(fetchUrl, fetchOptions);

  if (!response.ok) {
    await handleResponseError(response);
  }

  return {
    contentType: response.headers.get('content-type'),
    statusCode: response.status,
    body: await (json ? response.json() : response.text()),
  };
}

async function handleResponseError(response: Response) {
  const responseBodyString = await response.text();
  // eslint-disable-next-line no-console
  console.error('Error response', responseBodyString);
  let responseBodyJson: ErrorResponseBody | undefined;
  try {
    responseBodyJson = JSON.parse(responseBodyString as string);
  } catch (err) {
    // do nothing
  }
  const message =
    (response.status === 403 ? 'Forbidden: ' : '') +
    (responseBodyJson?.error?.message ?? responseBodyString);
  throw new Error(message);
}
