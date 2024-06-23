export const scan = async <T>(
  gen: AsyncGenerator<T>,
  visitor?: (value: T) => unknown
): Promise<void> => {
  for await (const v of gen) {
    if (visitor) {
      visitor(v);
    }
  }
};
