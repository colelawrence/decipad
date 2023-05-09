type FilterFunction<T> = (value: T, index: number) => boolean;

export const filter = async function* filter<T>(
  values: AsyncGenerator<T>,
  filterFn: FilterFunction<T>
): AsyncGenerator<T> {
  let index = -1;
  for await (const v of values) {
    index += 1;
    if (filterFn(v, index)) {
      yield v;
    }
  }
};
