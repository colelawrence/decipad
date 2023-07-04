export function fetch(
  _url: string | URL,
  init?: RequestInit
): ReturnType<typeof global.fetch> {
  let url: URL;
  if (typeof _url === 'string') {
    const base =
      'window' in global && 'location' in window
        ? window.location.origin
        : process.env.DECI_APP_URL_BASE || 'http://localhost:3000';
    url = new URL(_url, base);
  } else {
    url = _url;
  }
  const { href } = url;
  return global.fetch(href, init);
}
