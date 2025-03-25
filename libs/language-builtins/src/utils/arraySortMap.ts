export const arraySortMap = async <TValue>(
  array: TValue[],
  compare: (a: TValue, b: TValue) => number
): Promise<number[]> => {
  const sortable = Array.from({ length: array.length }, (_, i) => i);
  return sortable.sort((a, b) => compare(array[a], array[b]));
};
