export function toSlatePath(path) {
  return path ? path.filter((d) => Number.isInteger(d)) : [];
}
