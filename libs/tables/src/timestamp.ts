export function timestamp(d?: Date): number {
  return Math.round((d ?? new Date()).getTime() / 1000);
}
