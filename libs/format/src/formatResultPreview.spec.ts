import { expect, it } from 'vitest';
import { N } from '@decipad/number';
import { Unknown } from '@decipad/remote-computer';
import { formatResultPreview } from './formatResultPreview';

it('can summarize longer lists', async () => {
  expect(
    formatResultPreview({
      type: {
        indexedBy: 'col',
        atParentIndex: null,
        kind: 'column',
        cellType: {
          kind: 'number',
        },
      },
      value: [N(1), N(2), N(3)],
      meta: undefined,
    })
  ).toMatchInlineSnapshot(`"column of number"`);

  expect(
    formatResultPreview({
      type: {
        indexedBy: 'col',
        atParentIndex: null,
        kind: 'column',
        cellType: {
          kind: 'string',
        },
      },
      value: ['hello', 'world'],
      meta: undefined,
    })
  ).toMatchInlineSnapshot(`"column of string"`);
});

it('shows ranges', async () => {
  expect(
    formatResultPreview({
      type: {
        kind: 'range',
        rangeOf: {
          kind: 'number',
        },
      },
      value: [N(1), N(10)],
      meta: undefined,
    })
  ).toMatchInlineSnapshot(`"range(1 through 10)"`);
});

it('displays type errors', async () => {
  expect(
    formatResultPreview({
      type: {
        kind: 'number',
        unit: [
          { unit: 'meter', known: true, multiplier: N(1), exp: N(1) },
          { unit: 'second', known: true, multiplier: N(1), exp: N(-1) },
        ],
      },
      value: N(1, 2),
      meta: undefined,
    })
  ).toMatch(/unit|second|meter/i);
});

it('displays numbers with units', async () => {
  expect(
    formatResultPreview({
      type: {
        kind: 'number',
        unit: [
          {
            unit: 'second',
            known: true,
            multiplier: N(1_000_000_000),
            exp: N(1),
          },
        ],
      },
      value: N(1_000_000_000),
      meta: undefined,
    })
  ).toMatchInlineSnapshot(`"1 gigasecond"`);
});

it('random types', async () => {
  expect(
    formatResultPreview({
      type: {
        kind: 'nothing',
      },
      value: Unknown,
      meta: undefined,
    })
  ).toMatchInlineSnapshot(`"nothing"`);
  expect(
    formatResultPreview({
      type: {
        kind: 'boolean',
      },
      value: true,
      meta: undefined,
    })
  ).toMatchInlineSnapshot(`"true"`);
  expect(
    formatResultPreview({
      type: {
        kind: 'date',
        date: 'year',
      },
      value: 1577836800000n,
      meta: undefined,
    })
  ).toMatchInlineSnapshot(`"2020"`);
  expect(
    formatResultPreview({
      type: {
        kind: 'function',
        name: 'functionName',
        argNames: ['arg1', 'arg2'],
        body: undefined,
      },
      value: Unknown,
      meta: undefined,
    })
  ).toMatchInlineSnapshot(`"function"`);
});
