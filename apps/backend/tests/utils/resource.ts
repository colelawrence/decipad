export function encode(id: string): string {
  let newId = id.replace(/\//g, ':');
  if (newId.startsWith(':')) {
    newId = newId.substring(1);
  }
  return newId;
}

export function decode(id: string | undefined): string {
  let newId = (id || '').replace(/:/g, '/');
  if (!newId.startsWith('/')) {
    newId = `/${newId}`;
  }
  return newId;
}
