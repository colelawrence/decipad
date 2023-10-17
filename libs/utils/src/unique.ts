// keeps the order but omits repeated elements
export function unique<T>(all: Iterable<T>): Array<T> {
  const set = new Set<T>();
  const result = [];
  for (const elem of all) {
    if (!set.has(elem)) {
      set.add(elem);
      result.push(elem);
    }
  }
  return result;
}
