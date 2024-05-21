/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line no-restricted-imports
import { RuntimeError, Time, Value } from '@decipad/language-types';
import type { Value as ValueTypes } from '@decipad/language-interfaces';
import DeciNumber, { N } from '@decipad/number';
import { getDefined, getInstanceof } from '@decipad/utils';

const MAX_ITERATIONS = 10_000; // Failsafe

export async function columnFromSequence(
  startV: ValueTypes.Value,
  endV: ValueTypes.Value,
  byV?: ValueTypes.Value
): Promise<ValueTypes.ColumnLikeValue> {
  const [start, end] = await Promise.all(
    [startV, endV].map(async (val) =>
      getInstanceof(await val.getData(), DeciNumber)
    )
  );

  const by = byV
    ? ((await byV.getData()) as DeciNumber)
    : start.compare(end) < 0
    ? N(1)
    : N(-1);

  const array = [];

  // helper to allow decreasing sequences
  const cmpFn = (s: DeciNumber, e: DeciNumber, i: DeciNumber) => {
    return s.compare(e) < 0 ? i.compare(e) <= 0 : i.compare(e) >= 0;
  };

  let iterations = 0;
  for (let i = start; cmpFn(start, end, i); i = i.add(by)) {
    if (++iterations > MAX_ITERATIONS) {
      throw new RuntimeError(
        `A maximum number of ${MAX_ITERATIONS} has been reached in sequence. Check for an unbounded sequence in your code.`
      );
    }
    array.push(Value.Scalar.fromValue(i));
  }

  return Value.Column.fromValues(array, Value.defaultValue('column'));
}

// helper to allow decreasing date sequences
const cmpFn = (s: bigint, e: bigint, i: bigint) => {
  return s < e ? i <= e : i >= e;
};

// eslint-disable-next-line complexity
export async function columnFromDateSequence(
  startD: Value.DateValue,
  endD: Value.DateValue,
  by: Time.TimeUnit
): Promise<ValueTypes.ColumnLikeValue | undefined> {
  let start = await startD.getData();
  let end = await endD.getData();
  if (start == null || end == null) {
    return undefined;
  }
  if (end >= start) {
    end = endD.getEnd();
  } else {
    start = startD.getEnd();
  }
  if (start == null || end == null) {
    return undefined;
  }

  const spec = Time.getSpecificity(by);

  const array = [];

  const signal = start < end ? 1 : -1;
  const step = 1 * signal;

  let iterations = 0;
  for (
    let cur: bigint = start;
    cmpFn(start, end, cur);
    // eslint-disable-next-line no-await-in-loop
    cur = getDefined(await Time.addTime(cur, by, BigInt(step)))
  ) {
    if (++iterations > MAX_ITERATIONS) {
      throw new RuntimeError(
        `A maximum number of ${MAX_ITERATIONS} has been reached in sequence. Check for an unbounded sequence in your code.`
      );
    }

    array.push(Value.DateValue.fromDateAndSpecificity(cur, spec));
  }

  return Value.Column.fromValues(array);
}
