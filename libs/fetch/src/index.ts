export function fetch(url: string): ReturnType<typeof global.fetch> {
  const base =
    'location' in global
      ? global.location.origin
      : process.env.DECI_APP_URL_BASE || 'http://localhost:3000';
  const { href } = new URL(url, base);
  return global.fetch(href);
}
