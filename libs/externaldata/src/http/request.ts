import fetch from 'isomorphic-fetch';
import { ExternalKeyRecord } from '@decipad/backendtypes';
import { app } from '@decipad/config';
import { HttpError } from '../utils/HttpError';

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
  key: ExternalKeyRecord,
  json = false
): Promise<RequestResponse> {
  const config = app();
  const fetchOptions = {
    method: 'GET',
    headers: {
      Authorization: `${key.token_type || 'Bearer'} ${key.access_token}`,
      Referer: config.urlBase, // Google APIs require a referer header
    },
  };
  const response = await fetch(url.toString(), fetchOptions);

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
  let responseBodyJson: ErrorResponseBody | undefined;
  try {
    responseBodyJson = JSON.parse(responseBodyString as string);
  } catch (err) {
    // do nothing
  }
  const error = responseBodyJson?.error
    ? HttpError.fromResponse(responseBodyJson?.error)
    : new Error(responseBodyString);
  throw error;
}
