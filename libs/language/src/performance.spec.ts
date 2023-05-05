import { N } from '@decipad/number';
import { OneResult, Result, serializeResult } from './result';
import { AST } from './parser';
import { runAST } from '.';

const TEST_COLUMN_LENGTH = 1_000;
const OPS = ['+', '-', '/', '*', 'mod', '^'] as const;

const CI_SUCKINESS_FACTOR = 5;
const MIN_ROWS_PER_SEC = 2_500 / (process.env.CI ? CI_SUCKINESS_FACTOR : 1);
const OPS_MIN_ROWS_PER_SEC_SPECIAL_CASES: Record<string, number> =
  Object.fromEntries(
    Object.entries({
      '^': 1000,
    }).map(([op, minRowsPerSec]) => [
      op,
      minRowsPerSec / (process.env.CI ? CI_SUCKINESS_FACTOR : 1),
    ])
  );

const randomNumber = (max = 100_000) => BigInt(Math.floor(Math.random() * max));
const randomDeciNumber = () => N(randomNumber(), randomNumber());

const createProgram = (op: string): AST.Block => ({
  type: 'block',
  id: 'block1',
  args: [
    {
      type: 'assign',
      args: [
        { type: 'def', args: ['external1'] },
        { type: 'externalref', args: ['externalId'] },
      ],
    },
    {
      type: 'table',
      args: [
        { type: 'tabledef', args: ['table1'] },
        {
          type: 'table-column',
          args: [
            { type: 'coldef', args: ['Col1'] },
            {
              type: 'property-access',
              args: [
                { type: 'ref', args: ['external1'] },
                { type: 'colref', args: ['Col1'] },
              ],
            },
          ],
        },
        {
          type: 'table-column',
          args: [
            { type: 'coldef', args: ['Col2'] },
            {
              type: 'property-access',
              args: [
                { type: 'ref', args: ['external1'] },
                { type: 'colref', args: ['Col2'] },
              ],
            },
          ],
        },
        {
          type: 'table-column',
          args: [
            { type: 'coldef', args: ['Col3'] },
            {
              type: 'function-call',
              args: [
                { type: 'funcref', args: [op] },
                {
                  type: 'argument-list',
                  args: [
                    { type: 'ref', args: ['Col1'] },
                    { type: 'ref', args: ['Col2'] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});
describe('language performance', () => {
  it.each(OPS)('performs', async (op) => {
    const columnValues: Result = {
      type: {
        kind: 'table',
        columnNames: ['Col1', 'Col2'],
        columnTypes: [
          { kind: 'number', unit: null },
          { kind: 'number', unit: null },
        ],
        indexName: 'table1',
      },
      value: [0, 1].map(() =>
        Array.from({ length: TEST_COLUMN_LENGTH }).map(randomDeciNumber)
      ),
    };

    const externalData = {
      externalId: columnValues,
    };

    const program = createProgram(op);
    const startTime = Date.now();
    const r = await runAST(program, { externalData });
    const timeSpan = Date.now() - startTime;

    // validate result
    const result = serializeResult(r.type, r.value);
    expect(result.type.kind).toBe('table');
    if (result.type.kind === 'table') {
      for (const columnType of result.type.columnTypes) {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(columnType.kind).toBe('number');
      }
    } else {
      throw new Error('Expected result to be table');
    }
    expect(result.value).toHaveLength(3);
    for (const col of result.value as Array<OneResult>) {
      expect(col).toHaveLength(TEST_COLUMN_LENGTH);
    }

    // validate the time
    const rowPerSec = (TEST_COLUMN_LENGTH / timeSpan) * 1000;
    console.log(`rows per second for ${op} is ${rowPerSec}`);
    const minRowsPerSec =
      OPS_MIN_ROWS_PER_SEC_SPECIAL_CASES[op] ?? MIN_ROWS_PER_SEC;
    expect(rowPerSec).toBeGreaterThanOrEqual(minRowsPerSec);
  });
});
