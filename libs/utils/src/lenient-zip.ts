export const lenientZip = <K, V>(
  keys: K[],
  values: V[]
): [K | undefined, V | undefined][] => {
  const out = [];

  for (let i = 0; i < keys.length; i += 1) {
    const pair: [K, V] = [keys[i], values[i]];
    out.push(pair);
  }

  return out;
};
