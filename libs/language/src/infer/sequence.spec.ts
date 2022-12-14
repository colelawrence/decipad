import { build as t } from '../type';
import { l, n, seq, date } from '../utils';

import { makeContext } from './context';
import { inferSequence } from './sequence';

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
