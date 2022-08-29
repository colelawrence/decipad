/* eslint-disable no-underscore-dangle */
import Fraction from '@decipad/fraction';
import { addTime, getSpecificity } from '../date';
import type { Time } from '..';
import { Column, ColumnLike, DateValue, RuntimeError, Scalar, Value } from '.';

const MAX_ITERATIONS = 10_000; // Failsafe

export function fromSequence(
  startV: Value,
  endV: Value,
  byV?: Value
): ColumnLike {
  const [start, end] = [startV, endV].map((val) => val.getData() as Fraction);

  const by = byV
    ? (byV.getData() as Fraction)
    : start.compare(end) < 0
    ? new Fraction(1)
    : new Fraction(-1);

  const array = [];

  // helper to allow decreasing sequences
  const cmpFn = (s: Fraction, e: Fraction, i: Fraction) => {
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

  return Column.fromValues(array);
}

export function fromDateSequence(
  startD: DateValue,
  endD: DateValue,
  by: Time.Unit
): ColumnLike {
  let start = startD.getData();
  let end = endD.getData();
  if (end >= start) {
    end = endD.getEnd();
  } else {
    start = startD.getEnd();
  }

  const spec = getSpecificity(by);

  const array = [];

  // helper to allow decreasing date sequences
  const cmpFn = (s: bigint, e: bigint, i: bigint) => {
    return s < e ? i <= e : i >= e;
  };

  const signal = start < end ? 1 : -1;
  const step = 1 * signal;

  let iterations = 0;
  for (
    let cur = start;
    cmpFn(start, end, cur);
    cur = addTime(cur, by, BigInt(step))
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
