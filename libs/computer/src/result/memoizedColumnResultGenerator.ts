import type { Interpreter, Result } from '@decipad/language';
import { getDefined } from '@decipad/utils';

const keyOf = (start: number, end: number) =>
  `${start.toString()}-${end.toString()}`;

export const memoizedColumnResultGenerator = (
  gen: Interpreter.ResultGenerator
): Interpreter.ResultGenerator => {
  const memo = new Map<string, Array<Result.OneResult>>();
  return async function* generate(start = 0, end = Infinity) {
    if (end < start) {
      throw new Error('Error: result generator: end should be >= start');
    }
    const key = keyOf(start, end);
    if (memo.has(key)) {
      for (const v of getDefined(memo.get(key))) {
        yield v;
      }
      return;
    }

    // need to generate result
    const result = gen(start, end);

    const acc = [];
    for await (const v of result) {
      acc.push(v);
      yield v;
    }

    memo.set(key, acc);
  };
};
