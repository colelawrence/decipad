const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function columnNameFromIndex(index: number): string {
  const oneDigitIndex = index % base.length;
  const name = base[oneDigitIndex];
  if (index > base.length) {
    return name + columnNameFromIndex(index - base.length);
  }
  return name;
}
