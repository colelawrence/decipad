const trim = (s: string) => s.trim();

export const trimLines = (s: string): string =>
  s.split('\n').map(trim).join('\n');
