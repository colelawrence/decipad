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

interface RequestOptions {
  proxy?: URL;
  padId?: string;
}

function getFetchUrl(url: URL, proxy?: URL): URL {
  if (proxy == null) {
    return url;
  }

  const proxyUrl = new URL(proxy);
  proxyUrl.searchParams.set('url', url.toString());
  return proxyUrl;
}

export async function request(
  url: URL,
  json = false,
  options: RequestOptions = {}
): Promise<RequestResponse> {
  const fetchOptions = {
    method: 'GET',
    headers: {
      Referer: global.location.toString(),
    },
  };

  const fetchUrl = getFetchUrl(url, options.proxy);

  // Only add PadID if we are proxying the request.
  // Otherwise we can mess up the actual URL, since we
  // are requesting directly.
  if (options.proxy != null && options.padId != null) {
    fetchUrl.searchParams.set('padId', options.padId);
  }

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
