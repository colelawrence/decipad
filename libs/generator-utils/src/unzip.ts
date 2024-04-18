/* eslint-disable no-await-in-loop */
import { queuedGen } from './queuedGen';

/* eslint-disable no-empty-function */
const withIterator = <T1>(
  gen: AsyncGenerator<T1, unknown, undefined>
): AsyncIterator<T1, unknown, undefined> => gen[Symbol.asyncIterator]();
const withNext = <T1>(iter: AsyncIterator<T1>): Promise<IteratorResult<T1>> =>
  iter.next();

export function unzip<T1, T2>(
  gen: AsyncGenerator<[T1, T2]>,
  n: 2
): AsyncGenerator<[AsyncGenerator<T1>, AsyncGenerator<T2>]>;
export function unzip<T1, T2, T3>(
  gen: AsyncGenerator<[T1, T2, T3]>,
  n: 3
): AsyncGenerator<[AsyncGenerator<T1>, AsyncGenerator<T2>, AsyncGenerator<T3>]>;
export function unzip<T1, T2, T3, T4>(
  gen: AsyncGenerator<[T1, T2, T3, T4]>,
  n: 4
): AsyncGenerator<
  [
    AsyncGenerator<T1>,
    AsyncGenerator<T2>,
    AsyncGenerator<T3>,
    AsyncGenerator<T4>
  ]
>;
export function unzip<T1, T2, T3, T4, T5>(
  gen: AsyncGenerator<[T1, T2, T3, T4, T5]>,
  n: 5
): AsyncGenerator<
  [
    AsyncGenerator<T1>,
    AsyncGenerator<T2>,
    AsyncGenerator<T3>,
    AsyncGenerator<T4>,
    AsyncGenerator<T5>
  ]
>;
export function unzip<T>(
  gen: AsyncGenerator<Array<T>>,
  n: number
): AsyncGenerator<Array<AsyncGenerator<T>>>;

export async function* unzip(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gen: AsyncGenerator<ReadonlyArray<any>>,
  n: number
) {
  const subGenerators = Array.from({ length: n }, () => queuedGen());
  yield subGenerators.map((g) => g.gen());

  const iter = withIterator(gen);
  (async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const values = await withNext(iter);
      if (values.done) {
        subGenerators.forEach((subgen) => {
          subgen.end();
        });
        break;
      }
      values.value.map((value, i) => subGenerators[i].push(value));
    }
  })();
}
