const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const baseSize = base.length;

export function columnNameFromIndex(index: number): string {
  const oneDigitIndex = index % base.length;
  const name = base[oneDigitIndex];
  if (index >= baseSize) {
    const carry = Math.floor(index / baseSize) - 1;
    return columnNameFromIndex(carry) + name;
  }
  return name;
}
