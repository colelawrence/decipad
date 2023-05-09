export const firstOrUndefined = async function firstOrUndefined<T>(
  gen: AsyncGenerator<T>
): Promise<T | undefined> {
  const val = await gen.next();
  if (val.done) {
    return undefined;
  }
  return val.value;
};
