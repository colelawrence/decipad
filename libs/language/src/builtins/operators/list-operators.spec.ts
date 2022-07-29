import { runCode } from '../../run';
import { typeSnapshotSerializer } from '../../testUtils';

expect.addSnapshotSerializer(typeSnapshotSerializer);

describe('list operators', () => {
  it('concatenates lists', async () => {
    expect(await runCode('cat([1, 2], [3, 4])')).toMatchInlineSnapshot(`
      Object {
        "type": column<number, 4>,
        "value": Array [
          Fraction(1),
          Fraction(2),
          Fraction(3),
          Fraction(4),
        ],
      }
    `);
  });

  it('calculates columns lengths', async () => {
    expect(await runCode('len([1, 2, 3])')).toMatchInlineSnapshot(`
      Object {
        "type": number,
        "value": Fraction(3),
      }
    `);
  });

  it('retrieves the first element of a list', async () => {
    expect(await runCode('first([1, 2, 3] meters)')).toMatchInlineSnapshot(`
      Object {
        "type": meters,
        "value": Fraction(1),
      }
    `);
  });

  it('retrieves the last element of a list', async () => {
    expect(await runCode('last([1, 2, 3] meters)')).toMatchInlineSnapshot(`
      Object {
        "type": meters,
        "value": Fraction(3),
      }
    `);
  });

  it('countif: counts the true elements in a list', async () => {
    expect(await runCode('countif([true, false, true])'))
      .toMatchInlineSnapshot(`
        Object {
          "type": number,
          "value": Fraction(2),
        }
      `);
  });

  it('sorts a list', async () => {
    expect(await runCode('sort([2, -1, 11])')).toMatchInlineSnapshot(`
      Object {
        "type": column<number, 3>,
        "value": Array [
          Fraction(-1),
          Fraction(2),
          Fraction(11),
        ],
      }
    `);
  });

  it('uniques list', async () => {
    expect(await runCode('unique([1, 3, 2, 1, 3, 4])')).toMatchInlineSnapshot(`
      Object {
        "type": column<number>,
        "value": Array [
          Fraction(1),
          Fraction(2),
          Fraction(3),
          Fraction(4),
        ],
      }
    `);
  });

  it('reverses a list', async () => {
    expect(await runCode('reverse([3, 2, 1])')).toMatchInlineSnapshot(`
      Object {
        "type": column<number, 3>,
        "value": Array [
          Fraction(1),
          Fraction(2),
          Fraction(3),
        ],
      }
    `);
  });

  it('reverses a table', async () => {
    expect(
      await runCode(`
        Table = { A = [1, 2, 3], B = [6, 4, 5] }
        reverse(Table)
      `)
    ).toMatchInlineSnapshot(`
      Object {
        "type": table<A = number, B = number>,
        "value": Array [
          Array [
            Fraction(3),
            Fraction(2),
            Fraction(1),
          ],
          Array [
            Fraction(5),
            Fraction(4),
            Fraction(6),
          ],
        ],
      }
    `);
  });
});
