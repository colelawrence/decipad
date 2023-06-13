import { setupDeciNumberSnapshotSerializer } from '@decipad/number';
import { fasterNumber } from './fasterNumber';

setupDeciNumberSnapshotSerializer();

const numbers = (count: number) =>
  Array.from({ length: count }).map((_, index) => index);

const capacityDivider = process.env.CI ? 2 : 1;
const MIN_INT_NUMBERS_PER_MILISEC = 20 / capacityDivider;
const MIN_DECIMAL_NUMBERS_PER_MILISEC = 10 / capacityDivider;

describe('faster number performance', () => {
  it('performs on integer numbers', () => {
    const count = 100000;
    const ns = numbers(count);
    const start = Date.now();
    for (const n of ns) {
      fasterNumber(n);
    }
    const elapsed = Date.now() - start;
    const countPerMilisec = count / elapsed;
    expect(countPerMilisec).toBeGreaterThanOrEqual(MIN_INT_NUMBERS_PER_MILISEC);
  });

  it('performs on integer decimal numbers', () => {
    const count = 100000;
    const ns = numbers(count).map((n) => n / 3);
    const start = Date.now();
    for (const n of ns) {
      fasterNumber(n);
    }
    const elapsed = Date.now() - start;
    const countPerMilisec = count / elapsed;
    expect(countPerMilisec).toBeGreaterThanOrEqual(
      MIN_DECIMAL_NUMBERS_PER_MILISEC
    );
  });

  it('performs on strings of integer numbers', () => {
    const count = 100000;
    const ns = numbers(count).map((n) => n.toString());
    const start = Date.now();
    for (const n of ns) {
      fasterNumber(n);
    }
    const elapsed = Date.now() - start;
    const countPerMilisec = count / elapsed;
    expect(countPerMilisec).toBeGreaterThanOrEqual(MIN_INT_NUMBERS_PER_MILISEC);
  });

  it('performs on strings of decimal numbers', () => {
    const count = 100000;
    const ns = numbers(count).map((n) => (n / 3).toString());
    const start = Date.now();
    for (const n of ns) {
      fasterNumber(n);
    }
    const elapsed = Date.now() - start;
    const countPerMilisec = count / elapsed;
    expect(countPerMilisec).toBeGreaterThanOrEqual(
      MIN_DECIMAL_NUMBERS_PER_MILISEC
    );
  });
});
