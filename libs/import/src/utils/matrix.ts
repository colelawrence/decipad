export const matrix = <T>(
  columnCount: number,
  rowCount: number,
  startValue: T
): Array<Array<T>> => {
  const columns = Array.from({ length: columnCount });
  for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
    columns[columnIndex] = Array.from({ length: rowCount }).fill(startValue);
  }
  return columns as Array<Array<T>>;
};
