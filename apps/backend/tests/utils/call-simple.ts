import baseUrl from './base-url';

async function call(url: string, options: Record<string, any> = {}) {
  if (!url.startsWith('http')) {
    url = baseUrl() + url;
  }
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(
      'response was not ok: ' +
        response.status +
        ' : ' +
        (await response.text())
    );
  }

  return response;
}

export default call;

function withAuth(token: string) {
  return (url: string, options: Record<string, any> = {}) => {
    let headers = options.headers;
    if (!headers) {
      options.headers = headers = {};
    }
    let cookies = headers.Cookie || '';
    if (cookies.length > 0) {
      cookies += '; ';
    }
    headers.Cookie = `${cookies}next-auth.session-token=${token}`;
    options.credentials = 'same-origin';

    return call(url, options);
  };
}

export { withAuth };
