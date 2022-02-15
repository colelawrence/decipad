export const previousRefSymbols = new Set(['_', 'previous']);

export function isPreviousRef(ref: string): boolean {
  return previousRefSymbols.has(ref);
}
