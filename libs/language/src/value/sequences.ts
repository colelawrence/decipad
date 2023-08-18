/* eslint-disable no-underscore-dangle */
import DeciNumber, { N } from '@decipad/number';
import { getDefined } from '@decipad/utils';
import { RuntimeError, Time } from '..';
import { addTime, getSpecificity } from '../date';

import { Column, DateValue, Scalar } from './Value';
import { Value, ColumnLikeValue } from './types';
import { getInstanceof } from '../utils';
import { defaultValue } from './defaultValue';

const MAX_ITERATIONS = 10_000; // Failsafe

export async function columnFromSequence(
  startV: Value,
  endV: Value,
  byV?: Value
): Promise<ColumnLikeValue> {
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
    array.push(Scalar.fromValue(i));
  }

  return Column.fromValues(array, defaultValue('column'));
}

// helper to allow decreasing date sequences
const cmpFn = (s: bigint, e: bigint, i: bigint) => {
  return s < e ? i <= e : i >= e;
};

// eslint-disable-next-line complexity
export async function columnFromDateSequence(
  startD: DateValue,
  endD: DateValue,
  by: Time.Unit
): Promise<ColumnLikeValue | undefined> {
  let start = await startD.getData();
  let end = await endD.getData();
  if (start == null || end == null) {
    return undefined;
  }
  if (end >= start) {
    end = await endD.getEnd();
  } else {
    start = await startD.getEnd();
  }
  if (start == null || end == null) {
    return undefined;
  }

  const spec = getSpecificity(by);

  const array = [];

  const signal = start < end ? 1 : -1;
  const step = 1 * signal;

  let iterations = 0;
  for (
    let cur: bigint = start;
    cmpFn(start, end, cur);
    // eslint-disable-next-line no-await-in-loop
    cur = getDefined(await addTime(cur, by, BigInt(step)))
  ) {
    if (++iterations > MAX_ITERATIONS) {
      throw new RuntimeError(
        `A maximum number of ${MAX_ITERATIONS} has been reached in sequence. Check for an unbounded sequence in your code.`
      );
    }

    array.push(DateValue.fromDateAndSpecificity(cur, spec));
  }

  return Column.fromValues(array);
}
