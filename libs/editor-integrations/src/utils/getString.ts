export function getString(value: string | JSON): string {
  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
}
