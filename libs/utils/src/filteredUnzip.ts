export const filterUnzipped = <K, V>(
  keys: K[],
  values: V[],
  filterFn: (key: K, val: V) => boolean
): [K[], V[]] => {
  if (keys.length !== values.length) {
    throw new Error('panic: cannot filter arrays of different lengths');
  }

  const outKeys: K[] = [];
  const outValues: V[] = [];
  for (let i = 0; i < keys.length; i++) {
    if (filterFn(keys[i], values[i])) {
      outKeys.push(keys[i]);
      outValues.push(values[i]);
    }
  }

  return [outKeys, outValues];
};
