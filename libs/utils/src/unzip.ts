export const unzip = <K, V>(arg: [K, V][] | Iterable<[K, V]>): [K[], V[]] => {
  const keys = [];
  const values = [];

  for (const [k, v] of arg) {
    keys.push(k);
    values.push(v);
  }
  return [keys, values];
};
