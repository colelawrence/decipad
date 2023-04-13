export type CompareFn<TValue> = (
  a: TValue | undefined,
  b: TValue | undefined
) => number;
