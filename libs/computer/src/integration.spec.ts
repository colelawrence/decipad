import { getDefined } from '@decipad/utils';
import { N } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import { materializeResult } from '@decipad/language';
import { Computer } from './computer';
import { getIdentifiedBlocks } from './testUtils';

describe('cache', () => {
  it('epoch starts in 1', async () => {
    const computer = new Computer();
    const p1 = getIdentifiedBlocks('_A = 1', '_B = 2', '_C = _A + _B');
    const results = getDefined(await computer.computeRequest({ program: p1 }));
    expect(results.blockResults['block-2'].result?.value?.toString()).toBe('3');
    expect(
      Object.values(results.blockResults).map(
        (r) => r.type === 'computer-result' && r.epoch
      )
    ).toMatchInlineSnapshot(`
      Array [
        1n,
        1n,
        1n,
      ]
    `);
  });

  it('epoch increments', async () => {
    const computer = new Computer();
    const program = getIdentifiedBlocks('_A = 1', '_B = 2', '_C = _A + _B');
    const r1 = getDefined(await computer.computeRequest({ program }));
    expect(
      Object.values(r1.blockResults).map(
        (r) => r.type === 'computer-result' && r.epoch
      )
    ).toMatchInlineSnapshot(`
      Array [
        1n,
        1n,
        1n,
      ]
    `);
    const b3 = getIdentifiedBlocks('_A = 1', '_B = 2', '_C = _A + _B + 1')[2];
    program[2] = b3;
    const r2 = getDefined(await computer.computeRequest({ program }));
    expect(
      Object.values(r2.blockResults).map(
        (r) => r.type === 'computer-result' && r.epoch
      )
    ).toMatchInlineSnapshot(`
      Array [
        1n,
        1n,
        2n,
      ]
    `);

    const b1 = getIdentifiedBlocks('_A = 3', '_B = 2', '_C = _A + _B + 1')[0];
    program[0] = b1;
    const r3 = getDefined(await computer.computeRequest({ program }));
    expect(
      Object.values(r3.blockResults).map(
        (r) => r.type === 'computer-result' && r.epoch
      )
    ).toMatchInlineSnapshot(`
      Array [
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
    const results = getDefined(await computer.computeRequest({ program }));
    expect(Object.keys(results.blockResults)).toMatchInlineSnapshot(`
      Array [
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
