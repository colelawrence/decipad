export const zip = <K, V>(keys: K[], values: V[]): [K, V][] => {
  if (keys.length !== values.length) {
    throw new Error('panic: cannot zip arrays of different lengths');
  }

  const out = [];

  for (let i = 0; i < keys.length; i += 1) {
    const pair: [K, V] = [keys[i], values[i]];
    out.push(pair);
  }

  return out;
};
