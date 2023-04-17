export const chunks = <T>(
  arr: Array<T>,
  maxChunkSize: number
): Array<Array<T>> => {
  if (maxChunkSize < 1) {
    throw new Error(`Invalid chunkMaxSize of ${maxChunkSize}`);
  }
  const pending = [...arr];
  const result: Array<Array<T>> = [];
  while (pending.length > 0) {
    result.push(pending.splice(0, maxChunkSize));
  }
  return result;
};
