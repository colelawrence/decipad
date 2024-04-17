export function merge<T>(leaderArr: Array<T>, fillerArr: Array<T>) {
  const resultArr = Array<T | undefined>(
    Math.max(leaderArr.length, fillerArr.length)
  ).fill(undefined);

  for (let i = 0; i < resultArr.length; i++) {
    resultArr[i] = leaderArr[i] ?? fillerArr[i];
  }

  return resultArr;
}
