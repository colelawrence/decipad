import slug from 'slug';

export function encode(name: string, id: string): string {
  return encodeURIComponent(`${slug(name)}:${id}`);
}

export function decode(encodedUrlComponent: string): string {
  const parts = decodeURIComponent(encodedUrlComponent).split(':');
  return parts[parts.length - 1];
}
