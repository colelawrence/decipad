export const unzip = <K, V>(arg: Iterable<[K, V]>): [K[], V[]] => {
  const keys: K[] = [];
  const values: V[] = [];

  for (const [k, v] of arg) {
    keys.push(k);
    values.push(v);
  }
  return [keys, values];
};
