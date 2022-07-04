import { getUTCDateSpecificity, parseUTCDate, Time } from '../date';
import { build as t } from '../type';
import { l, n, seq, date, r } from '../utils';

import { makeContext } from './context';
import {
  getDateSequenceIncrement,
  getDateSequenceLength,
  getNumberSequenceCountN,
  inferSequence,
} from './sequence';

const nilCtx = makeContext();

it('infers sequences of numbers', async () => {
  expect(await inferSequence(nilCtx, seq(l(1), l(10), l(1)))).toEqual(
    t.column(t.number(), 10)
  );

  expect(await inferSequence(nilCtx, seq(l(10), l(1), l(-1)))).toEqual(
    t.column(t.number(), 10)
  );
});

it('catches multiple errors', async () => {
  const msg = async (start: number, end: number, by: number) =>
    (await inferSequence(nilCtx, seq(l(start), l(end), l(by)))).errorCause;
  expect(await msg(10, 1, 1)).toMatchObject({
    spec: {
      errType: 'invalid-sequence-step',
    },
  });
  expect(await msg(1, 10, -1)).toMatchObject({
    spec: {
      errType: 'invalid-sequence-step',
    },
  });
  expect(await msg(1, 10, 0)).toMatchObject({
    spec: {
      errType: 'sequence-step-zero',
    },
  });
});

describe('sequences of dates', () => {
  it('infers sequences of dates', async () => {
    expect(
      await inferSequence(
        nilCtx,
        seq(date('2020-01', 'year'), date('2021-01', 'year'), n('ref', 'year'))
      )
    ).toMatchObject({
      columnSize: 2,
      cellType: t.date('year'),
    });

    expect(
      (
        await inferSequence(
          nilCtx,
          seq(
            date('2020-01', 'month'),
            date('2020-01', 'month'),
            n('ref', 'year')
          )
        )
      ).errorCause
    ).toMatchInlineSnapshot(`[Error: Inference Error: free-form]`);
  });

  it('ensures start and end have the same specificity', async () => {
    expect(
      (
        await inferSequence(
          nilCtx,
          seq(
            date('2020-01', 'year'),
            date('2020-01', 'month'),
            n('ref', 'month')
          )
        )
      ).errorCause?.spec.errType
    ).toMatchInlineSnapshot(`"expected-but-got"`);
  });
});

describe('sequence counts', () => {
  it('gets the size of a sequence of numbers', () => {
    expect(getNumberSequenceCountN(1, 1, 1)).toEqual(1);
    expect(getNumberSequenceCountN(1, 2, 1)).toEqual(2);
    expect(getNumberSequenceCountN(1, 8, 3)).toEqual(3);
    expect(getNumberSequenceCountN(10, 1, -1)).toEqual(10);
  });

  it('avoids overflow', () => {
    expect(getNumberSequenceCountN(1, 7, 5)).toEqual(2);
    expect(getNumberSequenceCountN(7, 1, -5)).toEqual(2);
  });

  const dateSeqSize = (start: string, end: string, by: Time.Unit) => {
    const spec = getUTCDateSpecificity(start);
    return getDateSequenceLength(
      parseUTCDate(start),
      parseUTCDate(end),
      spec,
      by
    );
  };

  it('gets the size of a sequence of dates', () => {
    // We've got stars directing our fate
    // And we're praying it's not too late
    // Millennium
    expect(dateSeqSize('2000', '3000', 'millennium')).toEqual(2);
    expect(dateSeqSize('2000', '5000', 'millennium')).toEqual(4);

    // Centuries
    expect(dateSeqSize('2100', '2199', 'century')).toEqual(1);
    expect(dateSeqSize('2100', '2200', 'century')).toEqual(2);
    expect(dateSeqSize('2100', '3000', 'century')).toEqual(10);

    // Decades
    expect(dateSeqSize('2020', '2030', 'decade')).toEqual(2);
    expect(dateSeqSize('2020', '2119', 'decade')).toEqual(10);

    // Years
    expect(dateSeqSize('2020', '2020', 'year')).toEqual(1);

    // Quarters
    expect(dateSeqSize('2020-01', '2020-02', 'quarter')).toEqual(1);
    expect(dateSeqSize('2020-01', '2020-03', 'quarter')).toEqual(1);
    expect(dateSeqSize('2020-01', '2020-04', 'quarter')).toEqual(2);
    expect(dateSeqSize('2020-01', '2020-05', 'quarter')).toEqual(2);
    expect(dateSeqSize('2020-01', '2021-01', 'quarter')).toEqual(5);

    // Months
    expect(dateSeqSize('2020-01', '2020-01', 'month')).toEqual(1);
    expect(dateSeqSize('2020-01', '2020-03', 'month')).toEqual(3);

    // Days
    expect(dateSeqSize('2021-01-01', '2022-01-01', 'day')).toEqual(366);
    expect(dateSeqSize('2020-01-01', '2021-01-01', 'day')).toEqual(367);
    expect(dateSeqSize('2021-02-01', '2021-03-01', 'day')).toEqual(29);

    // Weeks
    expect(dateSeqSize('2021-02-01', '2021-03-01', 'week')).toEqual(5);
    expect(dateSeqSize('2021-02-01', '2021-02-08', 'week')).toEqual(2);
    expect(dateSeqSize('2021-02-01', '2021-02-03', 'week')).toEqual(1);

    // Time
    expect(dateSeqSize('2021-02-01T10:30', '2021-02-02T10:30', 'hour')).toEqual(
      25
    );

    // Across DST
    expect(dateSeqSize('2021-03-01T10:30', '2021-03-02T10:30', 'hour')).toEqual(
      25
    );
    expect(
      dateSeqSize('2021-02-01T10:30', '2021-02-02T10:30', 'minute')
    ).toEqual(60 * 24 + 1);
  });

  it('gets the size of a sequence of dates with a more granular increment', () => {
    expect(dateSeqSize('2020', '2020', 'month')).toEqual(12);
    expect(dateSeqSize('2020', '2021', 'month')).toEqual(24);

    expect(dateSeqSize('2020-02', '2020-02', 'day')).toEqual(29);
    expect(dateSeqSize('2020-01', '2020-02', 'day')).toEqual(31 + 29);

    expect(dateSeqSize('2020-02-01', '2020-02-01', 'hour')).toEqual(24);
    expect(dateSeqSize('2020-02-01', '2020-02-02', 'hour')).toEqual(48);
    expect(dateSeqSize('2020-02-01', '2020-02-01', 'minute')).toEqual(24 * 60);
  });

  it('allows to omit the "by" clause', async () => {
    expect((await inferSequence(nilCtx, seq(l(1), l(10)))).columnSize).toEqual(
      10
    );

    expect((await inferSequence(nilCtx, seq(l(10), l(1)))).columnSize).toEqual(
      10
    );

    expect(getDateSequenceIncrement(undefined, 'month', 'month')).toEqual(
      'month'
    );
    expect(getDateSequenceIncrement(undefined, 'hour', 'hour')).toEqual('hour');
    expect(getDateSequenceIncrement(undefined, 'week', 'hour')).toEqual('hour');
    expect(getDateSequenceIncrement(undefined, 'hour', 'week')).toEqual('hour');

    expect(getDateSequenceIncrement(r('month'), 'hour', 'hour')).toEqual(
      'month'
    );
  });
});
