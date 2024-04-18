const withIterator = <T1>(
  gen: AsyncGenerator<T1, unknown, undefined>
): AsyncIterator<T1, unknown, undefined> => gen[Symbol.asyncIterator]();
const withNext = <T1>(iter: AsyncIterator<T1>): Promise<IteratorResult<T1>> =>
  iter.next();
const withValue = <T>(res: IteratorResult<T>) => res.value;
const anyDone = (values: IteratorResult<unknown>[]) =>
  values.some((v) => v.done);
const allHaveValues = (values: IteratorResult<unknown>[]) =>
  values.every((v) => v.value != null);

export function zip<T1, T2>(
  gen1: AsyncGenerator<T1>,
  gen2: AsyncGenerator<T2>
): AsyncGenerator<[T1, T2]>;
export function zip<T1, T2, T3>(
  gen1: AsyncGenerator<T1>,
  gen2: AsyncGenerator<T2>,
  gen3: AsyncGenerator<T3>
): AsyncGenerator<[T1, T2, T3]>;
export function zip<T1, T2, T3, T4>(
  gen1: AsyncGenerator<T1>,
  gen2: AsyncGenerator<T2>,
  gen3: AsyncGenerator<T3>,
  gen4: AsyncGenerator<T4>
): AsyncGenerator<[T1, T2, T3, T4]>;
export function zip<T1, T2, T3, T4, T5>(
  gen1: AsyncGenerator<T1>,
  gen2: AsyncGenerator<T2>,
  gen3: AsyncGenerator<T3>,
  gen4: AsyncGenerator<T4>,
  gen5: AsyncGenerator<T5>
): AsyncGenerator<[T1, T2, T3, T4, T5]>;
export function zip<T>(
  ...gens: ReadonlyArray<AsyncGenerator<T>>
): AsyncGenerator<Array<T>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function* zip(...gens: ReadonlyArray<any>) {
  const iters = gens.map(withIterator);
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const values = await Promise.all(iters.map(withNext));
    if (anyDone(values)) {
      if (allHaveValues(values)) {
        yield values.map(withValue);
      }
      break;
    }
    yield values.map(withValue);
  }
}
