export const applySortMap = <TValue>(
  array: TValue[],
  sortMap: number[]
): TValue[] => {
  return sortMap.map((i) => array[i]);
};
