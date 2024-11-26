import { expect, describe, it } from 'vitest';
import { getDefined, timeout } from '@decipad/utils';
import { N } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import { materializeResult } from '@decipad/language';
import { Computer } from './computer';
import { getIdentifiedBlock, getIdentifiedBlocks } from './testUtils';
import { Result } from '@decipad/language-interfaces';
import { getExprRef } from './exprRefs';

describe('cache', () => {
  it('epoch starts in 1', async () => {
    const computer = new Computer();
    const p1 = getIdentifiedBlocks('_A = 1', '_B = 2', '_C = _A + _B');
    const results = getDefined(
      await computer.computeDeltaRequest({ program: { upsert: p1 } })
    );
    expect(results.blockResults['block-2'].result?.value?.toString()).toBe('3');
    expect(
      Object.values(results.blockResults).map(
        (r) => r.type === 'computer-result' && r.epoch
      )
    ).toMatchInlineSnapshot(`
      [
        1n,
        1n,
        1n,
      ]
    `);
  });

  it('epoch increments', async () => {
    const computer = new Computer();
    const program = getIdentifiedBlocks('_A = 1', '_B = 2', '_C = _A + _B');
    const r1 = getDefined(
      await computer.computeDeltaRequest({ program: { upsert: program } })
    );
    expect(
      Object.values(r1.blockResults).map(
        (r) => r.type === 'computer-result' && r.epoch
      )
    ).toMatchInlineSnapshot(`
      [
        1n,
        1n,
        1n,
      ]
    `);
    const b3 = getIdentifiedBlocks('_A = 1', '_B = 2', '_C = _A + _B + 1')[2];
    const r2 = getDefined(
      await computer.computeDeltaRequest({ program: { upsert: [b3] } })
    );
    expect(
      Object.values(r2.blockResults).map(
        (r) => r.type === 'computer-result' && r.epoch
      )
    ).toMatchInlineSnapshot(`
      [
        1n,
        1n,
        2n,
      ]
    `);

    const b1 = getIdentifiedBlocks('_A = 3', '_B = 2', '_C = _A + _B + 1')[0];
    const r3 = getDefined(
      await computer.computeDeltaRequest({ program: { upsert: [b1] } })
    );
    expect(
      Object.values(r3.blockResults).map(
        (r) => r.type === 'computer-result' && r.epoch
      )
    ).toMatchInlineSnapshot(`
      [
        3n,
        1n,
        3n,
      ]
    `);
  });
});

describe('first works', () => {
  it('works', async () => {
    const computer = new Computer();
    const program = getIdentifiedBlocks(
      'Initial = 7',
      `Table = {
        Id = [1 .. 10]
        Total = if first then Initial else previous(0) + Initial
      }`
    );
    const results = getDefined(
      await computer.computeDeltaRequest({ program: { upsert: program } })
    );
    expect(Object.keys(results.blockResults)).toMatchInlineSnapshot(`
      [
        "block-0",
        "block-1",
        "block-1_0",
        "block-1_1",
      ]
    `);
    const matResults = await Promise.all(
      Array.from(Object.values(results.blockResults)).map(async (result) =>
        materializeResult(getDefined(result.result))
      )
    );
    expect(matResults).toMatchObject([
      {
        type: {
          kind: 'number',
          unit: null,
        },
        value: N(7),
      },
      {
        type: {
          columnNames: ['Id', 'Total'],
          columnTypes: [
            {
              kind: 'number',
              unit: null,
            },
            {
              kind: 'number',
              unit: null,
            },
          ],
          delegatesIndexTo: 'exprRef_block_1',
          indexName: 'exprRef_block_1',
          kind: 'table',
        },
        value: [
          [N(1), N(2), N(3), N(4), N(5), N(6), N(7), N(8), N(9), N(10)],
          [N(7), N(14), N(21), N(28), N(35), N(42), N(49), N(56), N(63), N(70)],
        ],
      },
      {
        type: {
          cellType: {
            kind: 'number',
            unit: null,
          },
          indexedBy: 'exprRef_block_1',
          kind: 'column',
        },
        value: [N(1), N(2), N(3), N(4), N(5), N(6), N(7), N(8), N(9), N(10)],
      },
      {
        type: {
          cellType: {
            kind: 'number',
            unit: null,
          },
          indexedBy: 'exprRef_block_1',
          kind: 'column',
        },
        value: [
          N(7),
          N(14),
          N(21),
          N(28),
          N(35),
          N(42),
          N(49),
          N(56),
          N(63),
          N(70),
        ],
      },
    ]);
  });
});

describe('meta labels', () => {
  it('works 1 D', async () => {
    const computer = new Computer();
    const program = getIdentifiedBlocks(
      'Initial = 7',
      `Table = {
        Id = [1 .. 10]
        Total = if first then Initial else previous(0) + Initial
      }`,
      `JustOneColumn = Table.Total`,
      `JustAnotherColumn = Table.Total`,
      'YetAnotherColumn = Table.Total * 10'
    );
    const results = getDefined(
      await computer.computeDeltaRequest({ program: { upsert: program } })
    );
    const matResults = await Promise.all(
      Array.from(Object.values(results.blockResults)).map(async (result) =>
        materializeResult(getDefined(result.result))
      )
    );
    const labels = await Promise.all(
      matResults.map(async (r) => r.meta?.()?.labels)
    );
    expect(labels).toMatchInlineSnapshot(`
      [
        undefined,
        [
          [
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
          ],
        ],
        [
          [
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
          ],
        ],
        [
          [
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
          ],
        ],
        [
          [
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
          ],
        ],
        [
          [
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
          ],
        ],
        [
          [
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
          ],
        ],
      ]
    `);
  });

  it('works 2 D', async () => {
    const computer = new Computer();
    const program = getIdentifiedBlocks(
      'Initial = 7',
      `Table = {
        Id = [1 .. 10]
        Total = if first then Initial else previous(0) + Initial
      }`,
      `Table2 = {
        Id = [100 .. 110]
        Total = if first then Initial else previous(0) + Initial
      }`,
      'Combination = Table.Total * Table2.Total'
    );
    const results = getDefined(
      await computer.computeDeltaRequest({ program: { upsert: program } })
    );
    const matResults = await Promise.all(
      Array.from(Object.values(results.blockResults)).map(async (result) =>
        materializeResult(getDefined(result.result))
      )
    );
    const labels = await Promise.all(
      matResults.map(async (r) => r.meta?.()?.labels)
    );
    expect(labels).toMatchInlineSnapshot(`
      [
        undefined,
        [
          [
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
          ],
        ],
        [
          [
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
          ],
        ],
        [
          [
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
          ],
        ],
        [
          [
            "100",
            "101",
            "102",
            "103",
            "104",
            "105",
            "106",
            "107",
            "108",
            "109",
            "110",
          ],
        ],
        [
          [
            "100",
            "101",
            "102",
            "103",
            "104",
            "105",
            "106",
            "107",
            "108",
            "109",
            "110",
          ],
        ],
        [
          [
            "100",
            "101",
            "102",
            "103",
            "104",
            "105",
            "106",
            "107",
            "108",
            "109",
            "110",
          ],
        ],
        [
          [
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
          ],
          [
            "100",
            "101",
            "102",
            "103",
            "104",
            "105",
            "106",
            "107",
            "108",
            "109",
            "110",
          ],
        ],
      ]
    `);
  });
});

describe('expressionResultFromText$', () => {
  it('column smart refs in expressionResultFromText$ updates', async () => {
    const computer = new Computer();
    const program = getIdentifiedBlocks(
      `Table1 = { A = [1, 2, 3]}`,
      `Table1.B = [1, 2, 3]`
    );

    let lastResult: Result.AnyResult | undefined;
    await computer.pushComputeDelta({ program: { upsert: program } });

    const sub = computer
      .expressionResultFromText$(`sum(${getExprRef('block-1')})`)
      .subscribe((r) => {
        lastResult = r;
      });

    await timeout(500);

    expect(lastResult).toMatchInlineSnapshot(`
      {
        "meta": undefined,
        "type": {
          "kind": "number",
          "unit": null,
        },
        "value": DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 6n,
          "s": 1n,
        },
      }
    `);

    const lastBlock = getIdentifiedBlock(`Table1.B = [4, 5, 6]`, 1);
    await computer.pushComputeDelta({ program: { upsert: [lastBlock] } });

    await timeout(500);

    expect(lastResult).toMatchInlineSnapshot(`
      {
        "meta": undefined,
        "type": {
          "kind": "number",
          "unit": null,
        },
        "value": DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 15n,
          "s": 1n,
        },
      }
    `);

    sub.unsubscribe();
  });
});
