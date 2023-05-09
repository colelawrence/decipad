export const first = async function first<T>(
  gen: AsyncGenerator<T>
): Promise<T> {
  const val = await gen.next();
  if (val.done) {
    throw new Error('Empty');
  }
  return val.value;
};
