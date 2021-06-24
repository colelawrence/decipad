import slug from 'slug';

export function encode(name: string, id: string): string {
  return `${slug(name)}:${id}`;
}

export function decode(urlComponent: string): string {
  const parts = urlComponent.split(':');
  return parts[parts.length - 1];
}
