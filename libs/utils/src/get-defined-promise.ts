export async function getDefinedPromise<T>(
  o: Promise<T | null | undefined | void>,
  message = 'is not defined'
): Promise<T> {
  const o2 = await o;
  if (o2 == null) {
    throw new TypeError(message);
  }
  return o2;
}
