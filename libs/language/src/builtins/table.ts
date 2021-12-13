import Fraction from '@decipad/fraction';

export const approximateSubsetSumIndices = (
  upperBound: Fraction,
  table: unknown[][],
  columnIndex: number
): number[] => {
  const EPSILON = 0.01;

  // initialize a list L to contain one element 0.
  let l = [{ value: 0, rows: [] as number[] }];
  // for each i from 1 to n do
  for (let i = 0; i < table[columnIndex].length; i++) {
    // let Ui be a list containing all elements y in L, and all sums xi + y for all y in L.
    const u = [
      ...l,
      ...l.map(({ value, rows }) => ({
        value: value + (table[columnIndex][i] as number),
        rows: [...rows, i],
      })),
    ]
      // sort Ui in ascending order
      .sort(({ value: a }, { value: b }) => a - b);
    // make L empty
    l = [];
    // let y be the smallest element of Ui
    let y = u[0];
    // add y to L
    l.push(y);
    // for each element z of Ui in increasing order do
    for (const z of u) {
      // if y +  ε T/n < z ≤ T then
      if (
        y.value + EPSILON < z.value &&
        new Fraction(upperBound).compare(z.value) >= 0
      ) {
        y = z;
        l.push(z);
      }
    }
  }

  const best = l.slice(-1)[0];
  return best.rows;
};
