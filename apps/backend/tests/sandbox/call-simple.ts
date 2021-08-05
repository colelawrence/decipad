import baseUrl from './base-url';

type IOptions = Parameters<typeof fetch>[1] & {
  headers?: Record<string, string>;
  credentials?: string;
};

export default ({ apiPort }: { apiPort: number }) => {
  const origin = baseUrl(apiPort);
  return {
    call,
    withAuth(token: string) {
      return (url: string, _options?: IOptions) => {
        const { headers = {}, ...options } = _options || {};
        const cookies = headers.Cookie || '';
        const separator = cookies.length > 0 ? '; ' : '';
        headers.Cookie = `${cookies}${separator}next-auth.session-token=${token}`;
        options.credentials = 'same-origin';

        return call(url, { ...options, headers });
      };
    },
  };

  async function call(_url: string, options: RequestInit = {}) {
    const { href } = new URL(_url, origin);
    const response = await fetch(href, options);
    if (!response.ok) {
      throw new Error(
        `response was not ok: ${response.status} : ${await response.text()}`
      );
    }

    return response;
  }
};
