/* eslint-disable no-use-before-define */
import baseUrl from './base-url';

type IOptions = Parameters<typeof fetch>[1] & {
  headers?: Record<string, string>;
  credentials?: string;
};

interface CallSimple {
  fetch(url: string, options?: RequestInit): ReturnType<typeof fetch>;
  call(url: string, options?: RequestInit): ReturnType<typeof fetch>;
  withAuthOptions(token: string, options?: IOptions): IOptions;
  withAuth(
    token: string
  ): (url: string, options?: IOptions) => ReturnType<typeof fetch>;
  origin: string;
}

export default ({ apiPort }: { apiPort: number }): CallSimple => {
  const origin = baseUrl(apiPort);
  return {
    origin,
    fetch: justFetch,
    call,
    withAuthOptions,
    withAuth(token: string) {
      return (url: string, options?: IOptions) => {
        return call(url, withAuthOptions(token, options));
      };
    },
  };

  function withAuthOptions(token: string, _options?: IOptions) {
    const { headers = {}, ...options } = _options || {};
    const cookies = headers.Cookie || '';
    const separator = cookies.length > 0 ? '; ' : '';
    headers.Cookie = `${cookies}${separator}next-auth.session-token=${token}`;
    options.credentials = 'same-origin';
    return { ...options, headers };
  }

  async function call(url: string, options: RequestInit = {}) {
    const response = await justFetch(url, options);
    if (!response.ok && response.status >= 400) {
      throw new Error(
        `response from ${url} was not ok: ${
          response.status
        } : ${await response.text()}`
      );
    }

    return response;
  }

  function justFetch(
    url: string,
    options: RequestInit = {}
  ): ReturnType<typeof global.fetch> {
    const { href } = new URL(url, origin);
    return global.fetch(href, options);
  }
};
