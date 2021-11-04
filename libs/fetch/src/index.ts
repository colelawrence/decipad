export function fetch(url: string): ReturnType<typeof global.fetch> {
  const base =
    'location' in global ? global.location.origin : 'http://localhost:4200';
  const { href } = new URL(url, base);
  return global.fetch(href);
}
