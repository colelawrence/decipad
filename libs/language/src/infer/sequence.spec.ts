// eslint-disable-next-line no-restricted-imports
import { buildType as t } from '@decipad/language-types';
import { inferExpression } from '.';
import { l, n, seq, date } from '../utils';

import { makeContext } from './context';
import { inferSequence } from './sequence';
import { Realm } from '../interpreter/Realm';

const nilCtx = makeContext();
const nilRealm = new Realm(nilCtx);

it('infers sequences of numbers', async () => {
  expect(
    await inferSequence(nilRealm, seq(l(1), l(10), l(1)), inferExpression)
  ).toEqual(t.column(t.number()));

  expect(
    await inferSequence(nilRealm, seq(l(10), l(1), l(-1)), inferExpression)
  ).toEqual(t.column(t.number()));
});

it('catches multiple errors', async () => {
  const msg = async (start: number, end: number, by: number) =>
    (
      await inferSequence(
        nilRealm,
        seq(l(start), l(end), l(by)),
        inferExpression
      )
    ).errorCause;
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
        nilRealm,
        seq(date('2020-01', 'year'), date('2021-01', 'year'), n('ref', 'year')),
        inferExpression
      )
    ).toMatchObject({
      cellType: t.date('year'),
    });
  });

  it('ensures start and end have the same specificity', async () => {
    expect(
      (
        await inferSequence(
          nilRealm,
          seq(
            date('2020-01', 'year'),
            date('2020-01', 'month'),
            n('ref', 'month')
          ),
          inferExpression
        )
      ).errorCause?.spec.errType
    ).toMatchInlineSnapshot(`"expected-but-got"`);
  });
});
