const invert = ([k, v]: [string, string]) => [v, k];

export const invertMap = (map: Map<string, string>): Map<string, string> => {
  const entries = Array.from(map.entries());
  const invertedEntries = entries.map(invert) as Array<[string, string]>;
  return new Map(invertedEntries);
};
