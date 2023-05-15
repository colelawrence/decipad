import { N } from '@decipad/number';
import { Result, serializeResult } from './result';
import { AST } from './parser';
import { runAST } from '.';

const TEST_COLUMN_LENGTH = 10_000;
const OPS = ['+', '-', '/', '*', 'mod', '^'] as const;

const CI_SUCKINESS_FACTOR = 7;
const MIN_ROWS_PER_SEC = 2_000 / (process.env.CI ? CI_SUCKINESS_FACTOR : 1);
const OPS_MIN_ROWS_PER_SEC_SPECIAL_CASES: Record<string, number> =
  Object.fromEntries(
    Object.entries({
      '^': 500,
    }).map(([op, minRowsPerSec]) => [
      op,
      minRowsPerSec / (process.env.CI ? CI_SUCKINESS_FACTOR : 1),
    ])
  );

const randomNumber = (max = 100_000) => BigInt(Math.floor(Math.random() * max));
const notZeroRandomNumber = (max = 100_000): bigint => {
  let value: bigint | undefined;
  do {
    value = randomNumber(max);
  } while (value === 0n);
  return value;
};
const randomDeciNumber = () => N(randomNumber(), notZeroRandomNumber());

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
            { type: 'coldef', args: ['Col3'] },
            {
              type: 'function-call',
              args: [
                { type: 'funcref', args: [op] },
                {
                  type: 'argument-list',
                  args: [
                    {
                      type: 'property-access',
                      args: [
                        { type: 'ref', args: ['external1'] },
                        { type: 'colref', args: ['Col1'] },
                      ],
                    },
                    {
                      type: 'property-access',
                      args: [
                        { type: 'ref', args: ['external1'] },
                        { type: 'colref', args: ['Col2'] },
                      ],
                    },
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
// eslint-disable-next-line jest/no-disabled-tests
describe.skip('language performance', () => {
  it.each(OPS)('performs', async (op) => {
    const test = async () => {
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
      const r = await runAST(program, {
        externalData,
        doNotMaterialiseResults: true,
        doNotValidateResults: true,
      });
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
      expect(result.value).toHaveLength(1);
      for (const colValue of result.value as Array<unknown>) {
        expect(colValue).toHaveLength(TEST_COLUMN_LENGTH);
      }

      // validate the time
      const rowPerSec = (TEST_COLUMN_LENGTH / timeSpan) * 1000;
      console.log(`rows per second for ${op} is ${rowPerSec}`);
      const minRowsPerSec =
        OPS_MIN_ROWS_PER_SEC_SPECIAL_CASES[op] ?? MIN_ROWS_PER_SEC;
      expect(rowPerSec).toBeGreaterThanOrEqual(minRowsPerSec);
    };
    let done = false;
    while (!done) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await test();
      } catch (err) {
        if (
          !(err as Error).message.toLowerCase().includes('division by zero')
        ) {
          throw err;
        }
      }
      done = true;
    }
  });
});
