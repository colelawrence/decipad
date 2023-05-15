import { DeciNumber, N } from './DeciNumber';

const TEST_COLUMN_LENGTH = 10_000;
const OPS = ['add', 'sub', 'div', 'mul', 'mod', 'pow'] as const;
type OpName = typeof OPS[number];

const CI_SUCKINESS_FACTOR = 5;
const MIN_ROWS_PER_SEC = 1_000 / (process.env.CI ? CI_SUCKINESS_FACTOR : 1);
const OPS_MIN_ROWS_PER_SEC_SPECIAL_CASES: Record<string, number> =
  Object.fromEntries(
    Object.entries({
      pow: 500,
    }).map(([op, minRowsPerSec]) => [
      op,
      minRowsPerSec / (process.env.CI ? CI_SUCKINESS_FACTOR : 1),
    ])
  );

const randomNumber = (max = 100_000) => BigInt(Math.floor(Math.random() * max));
const randomDeciNumber = () => N(randomNumber(), randomNumber());

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('numbers performance', () => {
  it.each(OPS)('performs', async (operator: OpName) => {
    const run = () => {
      const columns = [0, 1].map(() =>
        Array.from({ length: TEST_COLUMN_LENGTH }).map(randomDeciNumber)
      );

      const method = DeciNumber.prototype[operator];
      const op = (n1: DeciNumber, n2: DeciNumber) => method.call(n1, n2);
      const startTime = Date.now();
      for (let i = 0; i < TEST_COLUMN_LENGTH; i += 1) {
        const [a, b] = columns.map((c) => c[i]);
        op(a, b);
      }
      const timeSpan = Date.now() - startTime;

      // validate the time
      const rowPerSec = (TEST_COLUMN_LENGTH / timeSpan) * 1000;
      console.log(`rows per second for ${operator} is ${rowPerSec}`);
      const minRowsPerSec =
        OPS_MIN_ROWS_PER_SEC_SPECIAL_CASES[operator] ?? MIN_ROWS_PER_SEC;
      expect(rowPerSec).toBeGreaterThanOrEqual(minRowsPerSec);
    };
    let done = false;
    while (!done) {
      try {
        run();
        done = true;
      } catch (err) {
        if (
          !(err as Error).message.toLowerCase().includes('division by zero')
        ) {
          throw err;
        }
      }
    }
  });
});
