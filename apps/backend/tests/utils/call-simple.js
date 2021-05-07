import baseUrl from './base-url';

async function callSimple(url, options) {
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

export default callSimple;

function withAuth({ token }) {
  return (url, options = {}) => {
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

    return callSimple(url, options);
  };
}

export { withAuth };
